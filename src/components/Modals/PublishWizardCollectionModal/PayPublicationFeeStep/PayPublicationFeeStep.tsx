import classNames from 'classnames'
import React, { useCallback, useMemo } from 'react'
import { ethers } from 'ethers'
import { Network } from '@dcl/schemas'
import { config } from 'config'
import { AuthorizationStepStatus, Button, Column, Icon, InfoTooltip, Loader, Mana, Modal, Row, Table } from 'decentraland-ui'
import ItemImage from 'components/ItemImage'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { toFixedMANAValue } from 'decentraland-dapps/dist/lib/mana'
import { Currency, Item } from 'modules/item/types'
import { isTPCollection } from 'modules/collection/utils'
import { PaymentMethod } from 'modules/collection/types'
import { Props } from '../PublishWizardCollectionModal.types'
import styles from './PayPublicationFeeStep.module.css'
import { getBackgroundStyle } from 'modules/item/utils'

const MultipleItemImages: React.FC<{ referenceItem: Item }> = ({ referenceItem }) => (
  <div className={styles.multipleItemImages}>
    <ItemImage item={referenceItem} className={styles.itemImage} />
    <div className={styles.layerOne} style={getBackgroundStyle(referenceItem.rarity)}></div>
    <div className={styles.layerTwo} style={getBackgroundStyle(referenceItem.rarity)}></div>
  </div>
)

export const PayPublicationFeeStep: React.FC<
  Props & { onNextStep: (paymentMethod: PaymentMethod, priceToPayInWei: string) => void; onPrevStep: () => void }
> = props => {
  const {
    collection,
    itemsToPublish,
    itemsWithChanges,
    price,
    wallet,
    collectionError,
    unsyncedCollectionError,
    isLoading,
    publishingStatus,
    thirdParty,
    isPublishCollectionsWertEnabled,
    onNextStep,
    onPrevStep
  } = props

  const isThirdParty = useMemo(() => isTPCollection(collection), [collection])
  const availableSlots = useMemo(() => thirdParty?.availableSlots ?? 0, [thirdParty?.availableSlots])
  const amountOfItemsToPublish = useMemo(
    () =>
      thirdParty?.isProgrammatic && thirdParty.published
        ? 0
        : itemsToPublish.length - availableSlots > 0
        ? itemsToPublish.length - availableSlots
        : 0,
    [thirdParty, itemsToPublish, availableSlots]
  )
  const amountOfItemsAlreadyPayed = useMemo(
    () => (thirdParty?.isProgrammatic && thirdParty.published ? itemsToPublish.length : amountOfItemsToPublish - itemsToPublish.length),
    [amountOfItemsToPublish, itemsToPublish.length]
  )
  const amountOfItemsAlreadyPublishedWithChanges = useMemo(() => itemsWithChanges.length, [itemsWithChanges])

  const priceUSD = useMemo(
    () => (thirdParty?.isProgrammatic ? price?.programmatic?.usd : price?.item.usd) ?? '0',
    [thirdParty?.isProgrammatic, price?.item.usd, price?.programmatic?.usd]
  )
  const totalPriceMANA = useMemo(() => {
    // Programmatic third parties should pay for the items only once, when they're being published
    if (thirdParty?.isProgrammatic && !thirdParty?.published) {
      return price?.programmatic?.mana ?? '0'
    } else if (thirdParty?.isProgrammatic && thirdParty?.published) {
      return '0'
    }
    return ethers.BigNumber.from(price?.item.mana ?? '0')
      .mul(itemsToPublish.length)
      .toString()
  }, [price?.item.mana, itemsToPublish, thirdParty?.isProgrammatic])
  const totalPriceUSD = useMemo(() => {
    // Programmatic third parties should pay for the items only once, when they're being published
    if (thirdParty?.isProgrammatic && !thirdParty?.published) {
      return priceUSD
    } else if (thirdParty?.isProgrammatic && thirdParty?.published) {
      return '0'
    }
    return ethers.BigNumber.from(priceUSD).mul(itemsToPublish.length).toString()
  }, [priceUSD, itemsToPublish])
  const hasInsufficientMANA = useMemo(
    () => !!wallet && wallet.networks.MATIC.mana < Number(ethers.utils.formatEther(totalPriceMANA)),
    [wallet, totalPriceMANA]
  )

  const renderErrorMessage = () => {
    let content: React.ReactNode | undefined = undefined

    if (!price) {
      content = <small className={styles.error}>{t('publish_collection_modal_with_oracle.rarities_error')}</small>
    } else if (hasInsufficientMANA) {
      content = (
        <small className={classNames(styles.notEnoughManaNotice, styles.error)}>
          {t('publish_collection_modal_with_oracle.not_enough_mana', {
            symbol: (
              <span>
                <Mana network={Network.MATIC} inline /> MANA
              </span>
            )
          })}
          <br />
          {t('publish_collection_modal_with_oracle.get_mana', {
            link: (
              <a href={config.get('ACCOUNT_URL', '')} rel="noopener noreferrer" target="_blank">
                Account dapp
              </a>
            )
          })}
        </small>
      )
    } else if (unsyncedCollectionError && !isLoading) {
      content = <small className={styles.error}>{t('publish_collection_modal_with_oracle.unsynced_collection')}</small>
    } else if (collectionError && !isLoading) {
      content = <small className={styles.error}>{collectionError}</small>
    }

    return content ? <div className={styles.errorContainer}>{content}</div> : null
  }

  const handleBuyWithMana = useCallback(() => {
    const priceToPayInWei = thirdParty
      ? ethers.utils.parseUnits((Number(ethers.utils.formatEther(ethers.BigNumber.from(totalPriceMANA))) * 1.005).toString()).toString()
      : totalPriceMANA
    onNextStep(PaymentMethod.MANA, priceToPayInWei)
  }, [!!thirdParty, totalPriceMANA, onNextStep])

  const handleBuyWithFiat = useCallback(() => {
    const priceToPayInWei = ethers.utils
      .parseUnits((Number(ethers.utils.formatEther(ethers.BigNumber.from(totalPriceMANA))) * 1.005).toString())
      .toString()
    onNextStep(PaymentMethod.FIAT, priceToPayInWei)
  }, [onNextStep, totalPriceMANA])

  return (
    <Modal.Content>
      <Column>
        <Row className={styles.details}>
          {isLoading && (
            <div className={styles.loadingOverlay}>
              <Loader inline size="massive" />
              {publishingStatus === AuthorizationStepStatus.PROCESSING
                ? 'Submitting for review'
                : t('publish_wizard_collection_modal.accept_in_wallet')}
            </div>
          )}
          <Column grow={true}>
            <span className={styles.title}>{t('publish_wizard_collection_modal.pay_publication_fee_step.title')}</span>
            <span className={styles.subtitle}>
              {t(`publish_wizard_collection_modal.pay_publication_fee_step.${thirdParty ? 'third_parties' : 'standard'}.subtitle`, {
                collection_name: <b>{collection.name}</b>,
                count: amountOfItemsToPublish,
                currency: 'USD',
                publication_fee: toFixedMANAValue(ethers.utils.formatEther(priceUSD))
              })}
            </span>
            <span className={styles.learnMore}>
              <a href="https://docs.decentraland.org/decentraland/publishing-wearables/" target="_blank" rel="noopener noreferrer">
                {t('publish_wizard_collection_modal.pay_publication_fee_step.learn_more')}
              </a>
            </span>
            <Table basic="very">
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>{t('publish_wizard_collection_modal.pay_publication_fee_step.quantity')}</Table.HeaderCell>
                  {!thirdParty?.isProgrammatic ? (
                    <Table.HeaderCell>{t('publish_wizard_collection_modal.pay_publication_fee_step.fee_per_item')}</Table.HeaderCell>
                  ) : null}
                  <Table.HeaderCell>
                    {t('publish_wizard_collection_modal.pay_publication_fee_step.total_in_usd', { currency: Currency.USD })}
                  </Table.HeaderCell>
                  <Table.HeaderCell>{t('publish_wizard_collection_modal.pay_publication_fee_step.total_in_mana')}</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {amountOfItemsToPublish ? (
                  <Table.Row>
                    <Table.Cell className={styles.itemCell}>
                      {amountOfItemsToPublish > 1 ? (
                        <MultipleItemImages referenceItem={itemsToPublish[0]} />
                      ) : (
                        <ItemImage item={itemsToPublish[0]} className={styles.itemImage} />
                      )}
                      {t('publish_wizard_collection_modal.pay_publication_fee_step.items', { count: amountOfItemsToPublish })}
                    </Table.Cell>
                    {!thirdParty?.isProgrammatic ? (
                      <Table.Cell>
                        {Currency.USD} {toFixedMANAValue(ethers.utils.formatEther(priceUSD))}
                      </Table.Cell>
                    ) : null}
                    <Table.Cell>
                      {Currency.USD} {toFixedMANAValue(ethers.utils.formatEther(totalPriceUSD))}
                    </Table.Cell>
                    <Table.Cell className={styles.totalAmount}>
                      <Mana showTooltip network={Network.MATIC} size="small">
                        {toFixedMANAValue(ethers.utils.formatEther(totalPriceMANA))}
                      </Mana>
                    </Table.Cell>
                  </Table.Row>
                ) : null}
                {amountOfItemsAlreadyPayed ? (
                  <Table.Row>
                    <Table.Cell className={styles.itemCell}>
                      {amountOfItemsAlreadyPayed > 1 ? (
                        <MultipleItemImages referenceItem={itemsToPublish[itemsToPublish.length - 1]} />
                      ) : (
                        <ItemImage item={itemsToPublish[itemsToPublish.length - 1]} className={styles.itemImage} />
                      )}
                      {t('publish_wizard_collection_modal.pay_publication_fee_step.items', { count: amountOfItemsAlreadyPayed })}
                    </Table.Cell>
                    <Table.Cell colSpan="3" className={styles.notPayable}>
                      {t('publish_wizard_collection_modal.pay_publication_fee_step.already_payed')}
                    </Table.Cell>
                  </Table.Row>
                ) : null}
                {amountOfItemsAlreadyPublishedWithChanges ? (
                  <Table.Row>
                    <Table.Cell className={styles.itemCell}>
                      {amountOfItemsAlreadyPublishedWithChanges > 1 ? (
                        <MultipleItemImages referenceItem={itemsWithChanges[0]} />
                      ) : (
                        <ItemImage item={itemsWithChanges[0]} className={styles.itemImage} />
                      )}
                      {t('publish_wizard_collection_modal.pay_publication_fee_step.items', { count: amountOfItemsToPublish })}
                    </Table.Cell>
                    <Table.Cell colSpan="3" className={styles.notPayable}>
                      {t('publish_wizard_collection_modal.pay_publication_fee_step.already_published')}
                    </Table.Cell>
                  </Table.Row>
                ) : null}
              </Table.Body>
            </Table>
          </Column>
        </Row>
        {renderErrorMessage()}
        <Row className={styles.actions}>
          <Button className="back" secondary onClick={onPrevStep} disabled={isLoading}>
            {t('global.back')}
          </Button>
          <div className={styles.actionsRight}>
            {isPublishCollectionsWertEnabled ? (
              <>
                {!isThirdParty && (
                  <>
                    <InfoTooltip
                      className={styles.payWithCardInfoTooltip}
                      position="bottom center"
                      content={t('publish_wizard_collection_modal.pay_publication_fee_step.pay_card_info')}
                    />
                    <Button className={styles.payWithCard} onClick={handleBuyWithFiat} disabled={isLoading} loading={isLoading}>
                      <Icon name="credit card outline" />
                      <span>{t('publish_wizard_collection_modal.pay_publication_fee_step.pay_card')}</span>
                    </Button>
                  </>
                )}
              </>
            ) : null}
            <Button primary onClick={handleBuyWithMana} disabled={hasInsufficientMANA || isLoading} loading={isLoading}>
              {ethers.BigNumber.from(totalPriceMANA).gt(0) ? (
                <>
                  <Mana inline size="small" network={Network.MATIC} />
                  <span>{t('publish_wizard_collection_modal.pay_publication_fee_step.pay_mana')}</span>
                </>
              ) : (
                t('global.proceed')
              )}
            </Button>
          </div>
        </Row>
      </Column>
    </Modal.Content>
  )
}

export default PayPublicationFeeStep
