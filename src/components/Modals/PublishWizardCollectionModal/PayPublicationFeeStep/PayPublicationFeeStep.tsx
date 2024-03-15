import React, { useCallback } from 'react'
import { ethers } from 'ethers'
import { Network } from '@dcl/schemas'
import { config } from 'config'
import { Button, Column, Mana, Modal, Row } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { toFixedMANAValue } from 'decentraland-dapps/dist/lib/mana'
import { Currency, Rarity } from 'modules/item/types'
import { PaymentMethod } from 'modules/collection/types'
import { MapStateProps } from '../PublishWizardCollectionModal.types'
import './PayPublicationFeeStep.css'

export const PayPublicationFeeStep: React.FC<
  MapStateProps & { onNextStep: (paymentMethod: PaymentMethod) => void; onPrevStep: () => void }
> = props => {
  const { collection, items, rarities, wallet, collectionError, unsyncedCollectionError, isLoading, onNextStep, onPrevStep } = props

  // The UI is designed in a way that considers that all rarities have the same price, so only using the first one
  // as reference for the prices is enough.
  const refRarity: Rarity | undefined = rarities[0]

  let priceUSD = '0'
  let totalPrice = '0'
  let totalPriceUSD = '0'
  let hasInsufficientMANA = true

  if (refRarity) {
    priceUSD = refRarity.prices!.USD

    totalPrice = ethers.BigNumber.from(refRarity.prices!.MANA).mul(items.length).toString()

    totalPriceUSD = ethers.BigNumber.from(priceUSD).mul(items.length).toString()

    hasInsufficientMANA = !!wallet && wallet.networks.MATIC.mana < Number(ethers.utils.formatEther(totalPrice))
  }

  const renderErrorMessage = () => {
    if (!refRarity) {
      return <p className="rarities-error error">{t('publish_collection_modal_with_oracle.rarities_error')}</p>
    } else if (hasInsufficientMANA) {
      return (
        <small className="not-enough-mana-notice error">
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
                Account
              </a>
            )
          })}
        </small>
      )
    } else if (unsyncedCollectionError && !isLoading) {
      return <p className="error danger-text">{t('publish_collection_modal_with_oracle.unsynced_collection')}</p>
    } else if (collectionError && !isLoading) {
      return <p className="error danger-text">{collectionError}</p>
    }

    return null
  }

  const handleBuyWithMana = useCallback(() => {
    onNextStep(PaymentMethod.MANA)
  }, [onNextStep])

  const handleBuyWithFiat = useCallback(() => {
    onNextStep(PaymentMethod.FIAT)
  }, [onNextStep])

  return (
    <Modal.Content className="PayPublicationFeeStep">
      <Column>
        <Row className="details">
          <Column grow={true}>
            <span className='title'>{t('publish_wizard_collection_modal.pay_publication_fee_step.title')}</span>
            <span className='subtitle'>
              {t('publish_wizard_collection_modal.pay_publication_fee_step.subtitle', {
                collection_name: <b>{collection.name}</b>,
                count: items.length,
                currency: 'USD',
                publication_fee: toFixedMANAValue(ethers.utils.formatEther(priceUSD))
              })}
            </span>
            <span className="learn-more">
              <a href="https://docs.decentraland.org/decentraland/publishing-wearables/" target="_blank" rel="noopener noreferrer">
                {t('publish_wizard_collection_modal.pay_publication_fee_step.learn_more')}
              </a>
            </span>
            <div className="price-breakdown-container">
              <div className="element">
                <div className="element-header">{t('publish_wizard_collection_modal.pay_publication_fee_step.quantity')}</div>
                <div className="element-content">
                  {t('publish_wizard_collection_modal.pay_publication_fee_step.items', { count: items.length })}
                </div>
              </div>
              <div className="element">
                <div className="element-header">{t('publish_wizard_collection_modal.pay_publication_fee_step.fee_per_item')}</div>
                <div className="element-content">
                  {Currency.USD} {toFixedMANAValue(ethers.utils.formatEther(priceUSD))}
                </div>
              </div>
              <div className="element">
                <div className="element-header">
                  {t('publish_wizard_collection_modal.pay_publication_fee_step.total_in_usd', { currency: Currency.USD })}
                </div>
                <div className="element-content total-amount">
                  {Currency.USD} {toFixedMANAValue(ethers.utils.formatEther(totalPriceUSD))}
                </div>
              </div>
              <div className="element">
                <div className="element-header">{t('publish_wizard_collection_modal.pay_publication_fee_step.total_in_mana')}</div>
                <div className="element-content total-amount">
                  <Mana showTooltip network={Network.MATIC} size="small">
                    {toFixedMANAValue(ethers.utils.formatEther(totalPrice))}
                  </Mana>
                </div>
              </div>
            </div>
          </Column>
        </Row>
        <Row className="actions">
          {renderErrorMessage()}
          <Button className="back" secondary onClick={onPrevStep} disabled={isLoading}>
            {t('global.back')}
          </Button>
          <div className="actions-right">
            <Button className="pay-with-card" onClick={handleBuyWithFiat} disabled={isLoading} loading={isLoading}>
              {t('publish_wizard_collection_modal.pay_publication_fee_step.pay_card')}
            </Button>
            <Button primary onClick={handleBuyWithMana} disabled={hasInsufficientMANA || isLoading} loading={isLoading}>
              {t('publish_wizard_collection_modal.pay_publication_fee_step.pay_mana')}
            </Button>
          </div>
        </Row>
      </Column>
    </Modal.Content>
  )
}

export default PayPublicationFeeStep
