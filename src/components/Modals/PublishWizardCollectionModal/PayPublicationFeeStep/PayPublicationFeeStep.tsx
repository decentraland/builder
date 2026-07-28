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
import { isTPCollection, shopCreditsNeededForPrice } from 'modules/collection/utils'
import { PaymentMethod } from 'modules/collection/types'
import { Props } from '../PublishWizardCollectionModal.types'
import styles from './PayPublicationFeeStep.module.css'
import { getBackgroundStyle } from 'modules/item/utils'
import creditsIcon from 'icons/credits.svg'

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
      onNextStep: (paymentMethod: PaymentMethod, priceToPayInWei: string, creditsAmount?: string) => void
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
    shopCreditsAvailable,
    isLoadingCredits,
    wallet,
    collectionError,
    unsyncedCollectionError,
    isLoading,
    publishingStatus,
    thirdParty,
    isPublishCollectionsWertEnabled,
    isCreditsForCollectionsFeeEnabled,
    isShopCreditsForCollectionsFeeEnabled,
    onNextStep,
    onPrevStep
  } = props

  const [useCredits, setUseCredits] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)

  const manaUrl = useMemo(() => config.get('ACCOUNT_URL', ''), [])
  const creditsUrl = useMemo(() => `${config.get('SHOP_URL', '')}/credits`, [])

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
    return BigInt(availableCredits) > BigInt(0)
  }, [availableCredits])

  const creditsToUse = useMemo(() => {
    if (!useCredits || !hasCredits) {
      return '0'
    }
    const totalPrice = BigInt(totalPriceMANA)
    const available = BigInt(availableCredits)
    return (available >= totalPrice ? totalPrice : available).toString()
  }, [totalPriceMANA, availableCredits, useCredits, hasCredits])

  const amountToPay = useMemo(() => {
    if (!useCredits || !hasCredits) {
      return totalPriceMANA
    }
    const remaining = BigInt(totalPriceMANA) - BigInt(creditsToUse)
    return remaining > BigInt(0) ? remaining.toString() : '0'
  }, [totalPriceMANA, creditsToUse, useCredits, hasCredits])

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

  const shopCreditsNeeded = useMemo(() => shopCreditsNeededForPrice(totalPriceUSD), [totalPriceUSD])

  const hasEnoughShopCredits = useMemo(() => shopCreditsAvailable >= shopCreditsNeeded, [shopCreditsAvailable, shopCreditsNeeded])

  const hasInsufficientMANA = useMemo(() => {
    return !!wallet && wallet.networks.MATIC.mana < Number(ethers.utils.formatEther(amountToPay))
  }, [wallet, amountToPay])

  const showCreditsMethod = isShopCreditsForCollectionsFeeEnabled && !isThirdParty
  const showCardMethod = isPublishCollectionsWertEnabled && !isThirdParty

  // Marketplace credits can be applied as partial payment on top of MANA and Card only.
  const canUseMarketplaceCredits =
    isCreditsForCollectionsFeeEnabled &&
    !isLoadingCredits &&
    (selectedPaymentMethod === PaymentMethod.MANA || selectedPaymentMethod === PaymentMethod.FIAT)
  const isApplyingCredits = canUseMarketplaceCredits && useCredits && hasCredits

  const manaBalance = wallet?.networks.MATIC.mana ?? 0

  // Whether the currently selected payment method has enough funds to cover the fee.
  // Card is always considered available (funds are handled by the payment processor).
  const enabledConfirm = useMemo(() => {
    switch (selectedPaymentMethod) {
      case PaymentMethod.SHOP_CREDITS:
        return hasEnoughShopCredits
      case PaymentMethod.FIAT:
        return true
      case PaymentMethod.MANA:
        return !hasInsufficientMANA
      default:
        return false
    }
  }, [selectedPaymentMethod, hasEnoughShopCredits, hasInsufficientMANA])

  const renderErrorMessage = () => {
    let content: React.ReactNode | undefined = undefined

    if (!price) {
      content = <small className={styles.error}>{t('publish_collection_modal_with_oracle.rarities_error')}</small>
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
    onNextStep(PaymentMethod.MANA, priceToPayInWei, creditsToUse)
  }, [!!thirdParty, totalPriceMANA, amountToPay, useCredits, creditsToUse, onNextStep])

  const handleBuyWithShopCredits = useCallback(() => {
    // '0' because no on-chain MANA payment is needed; the credits-server handles the charge.
    onNextStep(PaymentMethod.SHOP_CREDITS, '0')
  }, [onNextStep])

  const handleBuyWithFiat = useCallback(() => {
    // When using credits, we need to pass the amountToPay (after deducting credits)
    const basePrice = useCredits ? amountToPay : totalPriceMANA
    const priceToPayInWei = ethers.utils
      .parseUnits((Number(ethers.utils.formatEther(ethers.BigNumber.from(basePrice))) * 1.005).toString())
      .toString()
    onNextStep(PaymentMethod.FIAT, priceToPayInWei, creditsToUse)
  }, [useCredits, creditsToUse, onNextStep, totalPriceMANA, amountToPay])

  const handleConfirm = useCallback(() => {
    switch (selectedPaymentMethod) {
      case PaymentMethod.SHOP_CREDITS:
        return handleBuyWithShopCredits()
      case PaymentMethod.FIAT:
        return handleBuyWithFiat()
      case PaymentMethod.MANA:
        return handleBuyWithMana()
      default:
        return
    }
  }, [selectedPaymentMethod, handleBuyWithShopCredits, handleBuyWithFiat, handleBuyWithMana])

  const renderCreditsToggle = () => (
    <div className={styles.creditsToggleWrapper} onClick={e => e.stopPropagation()}>
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
    </div>
  )

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
                publication_fee: toFixedMANAValue(ethers.utils.formatEther(priceUSD)),
                link: (
                  <a
                    href="https://docs.decentraland.org/creator/wearables-and-emotes/publishing-collections/publishing-collections/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('publish_wizard_collection_modal.pay_publication_fee_step.learn_more')}
                  </a>
                )
              })}
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
                      {Currency.USD} {toFixedMANAValue(ethers.utils.formatEther(totalPriceUSD))}
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

            <span className={styles.payWithLabel}>{t('publish_wizard_collection_modal.pay_publication_fee_step.pay_with')}</span>
            <div className={styles.paymentMethods}>
              {/* MANA */}
              <label
                className={classNames(styles.methodCard, {
                  [styles.methodCardSelected]: selectedPaymentMethod === PaymentMethod.MANA
                })}
              >
                <div className={styles.methodMain}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    className={styles.methodRadio}
                    checked={selectedPaymentMethod === PaymentMethod.MANA}
                    onChange={() => setSelectedPaymentMethod(PaymentMethod.MANA)}
                    disabled={isLoading || isLoadingAuthorization}
                  />
                  <span className={styles.methodIcon}>
                    <Mana inline network={Network.MATIC} />
                  </span>
                  <div className={styles.methodInfo}>
                    <span className={styles.methodName}>{t('publish_wizard_collection_modal.pay_publication_fee_step.method_mana')}</span>
                    <span className={styles.methodBalance}>
                      {t('publish_wizard_collection_modal.pay_publication_fee_step.balance')}: <Mana network={Network.MATIC} inline />{' '}
                      {toFixedMANAValue(manaBalance.toString())}
                    </span>
                  </div>
                  <div className={styles.methodPrice}>
                    {isApplyingCredits ? (
                      <span className={styles.priceContainer}>
                        <span className={styles.originalPrice}>
                          <Mana network={Network.MATIC} size="small">
                            {toFixedMANAValue(ethers.utils.formatEther(totalPriceMANA))}
                          </Mana>
                        </span>
                        <span className={styles.adjustedPrice}>
                          <Mana network={Network.MATIC} size="small">
                            {toFixedMANAValue(ethers.utils.formatEther(amountToPay))}
                          </Mana>
                        </span>
                      </span>
                    ) : (
                      <Mana network={Network.MATIC} size="small">
                        {toFixedMANAValue(ethers.utils.formatEther(totalPriceMANA))}
                      </Mana>
                    )}
                  </div>
                </div>
                {isCreditsForCollectionsFeeEnabled && !isLoadingCredits && selectedPaymentMethod === PaymentMethod.MANA
                  ? renderCreditsToggle()
                  : null}
              </label>

              {/* Card */}
              {showCardMethod ? (
                <label
                  className={classNames(styles.methodCard, {
                    [styles.methodCardSelected]: selectedPaymentMethod === PaymentMethod.FIAT
                  })}
                >
                  <div className={styles.methodMain}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      className={styles.methodRadio}
                      checked={selectedPaymentMethod === PaymentMethod.FIAT}
                      onChange={() => setSelectedPaymentMethod(PaymentMethod.FIAT)}
                      disabled={isLoading || isLoadingAuthorization}
                    />
                    <span className={styles.methodIcon}>
                      <Icon name="credit card outline" />
                    </span>
                    <div className={styles.methodInfo}>
                      <span className={styles.methodName}>
                        {t('publish_wizard_collection_modal.pay_publication_fee_step.method_card')}
                        <span className={styles.methodInfoTooltip} onClick={e => e.stopPropagation()}>
                          <InfoTooltip
                            className={styles.methodTooltip}
                            position="top center"
                            content={t('publish_wizard_collection_modal.pay_publication_fee_step.pay_card_info')}
                          />
                        </span>
                      </span>
                    </div>
                    <div className={styles.methodPrice}>
                      {isApplyingCredits ? (
                        <span className={styles.priceContainer}>
                          <span className={styles.originalPrice}>
                            {Currency.USD} {toFixedMANAValue(ethers.utils.formatEther(totalPriceUSD))}
                          </span>
                          <span className={styles.adjustedPrice}>
                            {Currency.USD} {toFixedMANAValue(ethers.utils.formatEther(amountToPayUSD))}
                          </span>
                        </span>
                      ) : (
                        <span>
                          {Currency.USD} {toFixedMANAValue(ethers.utils.formatEther(totalPriceUSD))}
                        </span>
                      )}
                    </div>
                  </div>
                  {isCreditsForCollectionsFeeEnabled && !isLoadingCredits && selectedPaymentMethod === PaymentMethod.FIAT
                    ? renderCreditsToggle()
                    : null}
                </label>
              ) : null}

              {/* Shop Credits */}
              {showCreditsMethod ? (
                <label
                  className={classNames(styles.methodCard, {
                    [styles.methodCardSelected]: selectedPaymentMethod === PaymentMethod.SHOP_CREDITS
                  })}
                >
                  <div className={styles.methodMain}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      className={styles.methodRadio}
                      checked={selectedPaymentMethod === PaymentMethod.SHOP_CREDITS}
                      onChange={() => setSelectedPaymentMethod(PaymentMethod.SHOP_CREDITS)}
                      disabled={isLoading || isLoadingAuthorization}
                    />
                    <span className={styles.methodIcon}>
                      <img src={creditsIcon} alt="" className={styles.creditsIcon} />
                    </span>
                    <div className={styles.methodInfo}>
                      <span className={styles.methodName}>
                        {t('publish_wizard_collection_modal.pay_publication_fee_step.method_credits')}
                        <span className={styles.methodInfoTooltip} onClick={e => e.stopPropagation()}>
                          <InfoTooltip
                            className={styles.methodTooltip}
                            position="top center"
                            hoverable
                            mouseLeaveDelay={500}
                            content={
                              <span>
                                {t('publish_wizard_collection_modal.pay_publication_fee_step.shop_credits_info')}{' '}
                                <a href={creditsUrl} target="_blank" rel="noopener noreferrer">
                                  {t('publish_wizard_collection_modal.pay_publication_fee_step.shop_credits_info_link')}
                                </a>
                              </span>
                            }
                          />
                        </span>
                      </span>
                      <span className={styles.methodBalance}>
                        {t('publish_wizard_collection_modal.pay_publication_fee_step.balance')}:{' '}
                        <img src={creditsIcon} alt="" className={styles.balanceCreditsIcon} /> {shopCreditsAvailable}
                      </span>
                    </div>
                    <div className={styles.methodPrice}>
                      <span className={styles.creditsPrice}>
                        <img src={creditsIcon} alt="" className={styles.balanceCreditsIcon} /> {shopCreditsNeeded}
                      </span>
                    </div>
                  </div>
                </label>
              ) : null}
            </div>
            {selectedPaymentMethod === PaymentMethod.MANA && hasInsufficientMANA ? (
              <div className={styles.insufficientBalanceRow}>
                <span className={styles.insufficientBalanceLabel}>
                  {t('publish_wizard_collection_modal.pay_publication_fee_step.insufficient_balance')}
                </span>
                <a className={styles.getCurrencyButton} href={manaUrl} target="_blank" rel="noopener noreferrer">
                  {t('publish_wizard_collection_modal.pay_publication_fee_step.get_mana_button')}
                </a>
              </div>
            ) : null}
            {selectedPaymentMethod === PaymentMethod.SHOP_CREDITS && !hasEnoughShopCredits ? (
              <div className={styles.insufficientBalanceRow}>
                <span className={styles.insufficientBalanceLabel}>
                  {t('publish_wizard_collection_modal.pay_publication_fee_step.insufficient_balance')}
                </span>
                <a className={styles.getCurrencyButton} href={creditsUrl} target="_blank" rel="noopener noreferrer">
                  {t('publish_wizard_collection_modal.pay_publication_fee_step.get_credits_button')}
                </a>
              </div>
            ) : null}
          </Column>
        </Row>
        {renderErrorMessage()}
        <Row className={styles.actions}>
          <Button className="back" secondary onClick={onPrevStep} disabled={isLoading || isLoadingAuthorization}>
            {t('global.back')}
          </Button>
          <div className={styles.actionsRight}>
            <Button
              primary
              onClick={handleConfirm}
              disabled={!enabledConfirm || isLoading || isLoadingAuthorization}
              loading={isLoading || isLoadingAuthorization}
            >
              {t('publish_wizard_collection_modal.pay_publication_fee_step.confirm')}
            </Button>
          </div>
        </Row>
      </Column>
    </Modal.Content>
  )
}

export default PayPublicationFeeStep
