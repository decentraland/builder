import classNames from 'classnames'
import React, { useCallback, useMemo, useState } from 'react'
import { ethers } from 'ethers'
import { Network } from '@dcl/schemas'
import { config } from 'config'
import { AuthorizationStepStatus, Button, Column, Icon, InfoTooltip, Loader, Mana, Modal, Row, Table } from 'decentraland-ui'
import { CreditsToggle } from 'decentraland-ui2'
import ItemImage from 'components/ItemImage'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { WithAuthorizedActionProps } from 'decentraland-dapps/dist/containers/withAuthorizedAction'
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
  Props &
    WithAuthorizedActionProps & {
      onNextStep: (paymentMethod: PaymentMethod, priceToPayInWei: string, useCredits?: boolean) => void
      onPrevStep: () => void
    }
> = props => {
  const {
    collection,
    itemsToPublish,
    itemsWithChanges,
    authorizationError,
    isLoadingAuthorization,
    isMagicAutoSignEnabled,
    isUsingMagic,
    price,
    credits,
    isLoadingCredits,
    wallet,
    collectionError,
    unsyncedCollectionError,
    isLoading,
    publishingStatus,
    thirdParty,
    isPublishCollectionsWertEnabled,
    isCreditsForCollectionsFeeEnabled,
    onNextStep,
    onPrevStep
  } = props

  const [useCredits, setUseCredits] = useState(false)

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

  const availableCredits = useMemo(() => {
    if (!credits || !credits.credits || credits.credits.length === 0) {
      return '0'
    }
    return credits.totalCredits.toString()
  }, [credits])

  const hasCredits = useMemo(() => {
    return credits && credits.credits && credits.credits.length > 0 && BigInt(availableCredits) > BigInt(0)
  }, [credits, availableCredits])

  const amountToPay = useMemo(() => {
    if (!useCredits || !hasCredits) {
      return totalPriceMANA
    }
    const remaining = BigInt(totalPriceMANA) - BigInt(availableCredits)
    return remaining > BigInt(0) ? remaining.toString() : '0'
  }, [totalPriceMANA, availableCredits, useCredits, hasCredits])

  const amountToPayUSD = useMemo(() => {
    if (!useCredits || !hasCredits) {
      return totalPriceUSD
    }
    // Credits are in MANA, so we need to convert the remaining MANA to USD
    // Using the ratio: (remainingMANA * totalUSD) / totalMANA
    const remainingMANA = BigInt(amountToPay)
    if (remainingMANA === BigInt(0)) {
      return '0'
    }
    const totalUSD = BigInt(totalPriceUSD)
    const totalMANA = BigInt(totalPriceMANA)
    const remainingUSD = (remainingMANA * totalUSD) / totalMANA
    return remainingUSD.toString()
  }, [totalPriceUSD, totalPriceMANA, amountToPay, useCredits, hasCredits])

  const hasInsufficientMANA = useMemo(() => {
    return !!wallet && wallet.networks.MATIC.mana < Number(ethers.utils.formatEther(amountToPay))
  }, [wallet, amountToPay])

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
    } else if (authorizationError) {
      content = <small className={styles.error}>{authorizationError}</small>
    }

    return content ? <div className={styles.errorContainer}>{content}</div> : null
  }

  const handleBuyWithMana = useCallback(() => {
    // When using credits, we need to pass the amountToPay (after deducting credits)
    // so the authorization logic knows whether to request allowance or not
    const basePrice = useCredits ? amountToPay : totalPriceMANA
    const priceToPayInWei = thirdParty
      ? ethers.utils.parseUnits((Number(ethers.utils.formatEther(ethers.BigNumber.from(basePrice))) * 1.005).toString()).toString()
      : basePrice
    onNextStep(PaymentMethod.MANA, priceToPayInWei, useCredits)
  }, [!!thirdParty, totalPriceMANA, amountToPay, useCredits, onNextStep])

  const handleBuyWithFiat = useCallback(() => {
    // When using credits, we need to pass the amountToPay (after deducting credits)
    const basePrice = useCredits ? amountToPay : totalPriceMANA
    const priceToPayInWei = ethers.utils
      .parseUnits((Number(ethers.utils.formatEther(ethers.BigNumber.from(basePrice))) * 1.005).toString())
      .toString()
    onNextStep(PaymentMethod.FIAT, priceToPayInWei, useCredits)
  }, [useCredits, onNextStep, totalPriceMANA, amountToPay])

  return (
    <Modal.Content>
      <Column>
        <Row className={styles.details}>
          {isLoading || isLoadingAuthorization ? (
            <div className={styles.loadingOverlay}>
              <Loader inline size="massive" />
              {publishingStatus === AuthorizationStepStatus.PROCESSING || (isUsingMagic && isMagicAutoSignEnabled)
                ? t('publish_wizard_collection_modal.pay_publication_fee_step.submitting_for_review')
                : t('publish_wizard_collection_modal.accept_in_wallet')}
            </div>
          ) : null}
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
                  <Table.HeaderCell />
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
                    <Table.Cell className={styles.totalAmount}>
                      {useCredits && hasCredits ? (
                        <div className={styles.priceContainer}>
                          <span className={styles.originalPrice}>
                            {Currency.USD} {toFixedMANAValue(ethers.utils.formatEther(totalPriceUSD))}
                          </span>
                          <span className={styles.adjustedPrice}>
                            {Currency.USD} {toFixedMANAValue(ethers.utils.formatEther(amountToPayUSD))}
                          </span>
                        </div>
                      ) : (
                        <>
                          {Currency.USD} {toFixedMANAValue(ethers.utils.formatEther(totalPriceUSD))}
                        </>
                      )}
                    </Table.Cell>
                    <Table.Cell className={styles.totalAmount}>
                      {useCredits && hasCredits ? (
                        <div className={styles.priceContainer}>
                          <span className={styles.originalPrice}>
                            <Mana showTooltip network={Network.MATIC} size="small">
                              {toFixedMANAValue(ethers.utils.formatEther(totalPriceMANA))}
                            </Mana>
                          </span>
                          <span className={styles.adjustedPrice}>
                            <Mana showTooltip network={Network.MATIC} size="small">
                              {toFixedMANAValue(ethers.utils.formatEther(amountToPay))}
                            </Mana>
                          </span>
                        </div>
                      ) : (
                        <Mana showTooltip network={Network.MATIC} size="small">
                          {toFixedMANAValue(ethers.utils.formatEther(totalPriceMANA))}
                        </Mana>
                      )}
                    </Table.Cell>
                    <Table.Cell className={styles.creditsCell}>
                      {isCreditsForCollectionsFeeEnabled && !isLoadingCredits && (
                        <CreditsToggle
                          totalCredits={availableCredits}
                          assetPrice={totalPriceMANA}
                          useCredits={useCredits}
                          onToggle={setUseCredits}
                          showLearnMore={!hasCredits}
                          learnMoreUrl="https://decentraland.org/blog/announcements/marketplace-credits-earn-weekly-rewards-to-power-up-your-look"
                          label={
                            hasCredits
                              ? t('publish_wizard_collection_modal.pay_publication_fee_step.use_credits')
                              : t('publish_wizard_collection_modal.pay_publication_fee_step.pay_with_credits')
                          }
                          tooltipContent={t('credits.value')}
                        />
                      )}
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
          <Button className="back" secondary onClick={onPrevStep} disabled={isLoading || isLoadingAuthorization}>
            {t('global.back')}
          </Button>
          {ethers.BigNumber.from(amountToPay).eq(0) ? (
            <div className={styles.actionsRight}>
              <Button
                primary
                onClick={handleBuyWithMana}
                disabled={isLoading || isLoadingAuthorization}
                loading={isLoading || isLoadingAuthorization}
                className={styles.checkoutButton}
              >
                {t('publish_wizard_collection_modal.pay_publication_fee_step.checkout')}
              </Button>
            </div>
          ) : (
            <div className={styles.actionsRight}>
              {isPublishCollectionsWertEnabled && !useCredits ? (
                <>
                  {!isThirdParty && (
                    <>
                      <InfoTooltip
                        className={styles.payWithCardInfoTooltip}
                        position="bottom center"
                        content={t('publish_wizard_collection_modal.pay_publication_fee_step.pay_card_info')}
                      />
                      <Button className={styles.payByCardButton} onClick={handleBuyWithFiat} disabled={isLoading} loading={isLoading}>
                        <Icon name="credit card outline" />
                        <span>{t('publish_wizard_collection_modal.pay_publication_fee_step.pay_card')}</span>
                      </Button>
                    </>
                  )}
                </>
              ) : null}
              <Button
                primary
                onClick={handleBuyWithMana}
                disabled={hasInsufficientMANA || isLoading || isLoadingAuthorization}
                loading={isLoading || isLoadingAuthorization}
              >
                <Mana inline size="small" network={Network.MATIC} />
                <span>{t('publish_wizard_collection_modal.pay_publication_fee_step.pay_mana')}</span>
              </Button>
            </div>
          )}
        </Row>
      </Column>
    </Modal.Content>
  )
}

export default PayPublicationFeeStep
