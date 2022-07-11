import * as React from 'react'
import { ethers } from 'ethers'
import { Network } from '@dcl/schemas'
import { ModalNavigation, Button, Mana, Loader, Field, InputOnChangeData, Form } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { config } from 'config'
import { Currency, Rarity } from 'modules/item/types'
import { emailRegex } from 'lib/validators'
import { Props, State } from './PublishCollectionModal.types'
import './PublishCollectionModal.css'

export default class PublishCollectionModal extends React.PureComponent<Props, State> {
  state: State = { step: 1, email: undefined, emailFocus: false }

  componentDidMount() {
    const { collection, onClose, onFetchRarities } = this.props

    if (!collection) {
      onClose()
    }

    onFetchRarities()
  }

  handleNextStep = () => {
    this.setState({ step: 3 })
  }

  handlePublish = () => {
    const { collection, items, onPublish } = this.props
    const { email } = this.state
    onPublish(collection!, items, email!)
  }

  handleEmailChange = (_: unknown, data: InputOnChangeData): void => {
    this.setState({ email: data.value })
  }

  handleEmailFocus = () => {
    this.setState({ emailFocus: true })
  }

  handleEmailBlur = () => {
    this.setState({ emailFocus: false })
  }

  handleProceed = () => {
    this.setState({ step: 2 })
  }

  renderFirstStep = () => {
    const { items, wallet, onClose, rarities, itemError, isFetchingItems, isFetchingRarities } = this.props

    // The UI is designed in a way that considers that all rarities have the same price, so only using the first one
    // as reference for the prices is enough.
    const refRarity: Rarity | undefined = rarities[0]

    let priceUSD: string | undefined
    let totalPrice: string | undefined
    let totalPriceUSD: string | undefined
    let hasInsufficientMANA = true

    if (refRarity) {
      priceUSD = refRarity.prices!.USD

      totalPrice = ethers.BigNumber.from(refRarity.prices!.MANA)
        .mul(items.length)
        .toString()

      totalPriceUSD = ethers.BigNumber.from(priceUSD)
        .mul(items.length)
        .toString()

      hasInsufficientMANA = !!wallet && wallet.networks.MATIC.mana < Number(ethers.utils.formatEther(totalPrice))
    }

    return (
      <>
        <ModalNavigation title={t('publish_collection_modal_with_oracle.title')} onClose={onClose} />
        <Modal.Content className="first-step">
          {isFetchingItems || isFetchingRarities ? (
            <div className="loader-wrapper">
              <Loader size="big" active={isFetchingItems || isFetchingRarities} />
            </div>
          ) : !!itemError || !refRarity ? (
            <>
              <p className="rarities-error error">{t('publish_collection_modal_with_oracle.rarities_error')}</p>
              <p className="rarities-error-sub error">{itemError}</p>
            </>
          ) : (
            <>
              <p>
                {t('publish_collection_modal_with_oracle.items_breakdown_title', {
                  count: items.length,
                  publicationFee: ethers.utils.formatEther(priceUSD!),
                  currency: Currency.USD
                })}
              </p>
              <a href="https://docs.decentraland.org/decentraland/publishing-wearables/" target="_blank" rel="noopener noreferrer">
                {t('publish_collection_modal_with_oracle.learn_more')}
              </a>
              <div className="price-breakdown-container">
                <div className="element">
                  <div className="element-header">{t('publish_collection_modal_with_oracle.qty_of_items')}</div>
                  <div className="element-content">{items.length}</div>
                </div>
                <div className="element">
                  <div className="element-header">{t('publish_collection_modal_with_oracle.fee_per_item')}</div>
                  <div className="element-content">
                    {Currency.USD} {ethers.utils.formatEther(priceUSD!)}
                  </div>
                </div>
                <div className="element">
                  <div className="element-header">{t('publish_collection_modal_with_oracle.total_in_usd', { currency: Currency.USD })}</div>
                  <div className="element-content">
                    {Currency.USD} {ethers.utils.formatEther(totalPriceUSD!)}
                  </div>
                </div>
                <div className="element">
                  <div className="element-header">{t('publish_collection_modal_with_oracle.total_in_mana')}</div>
                  <div className="element-content">
                    <Mana network={Network.MATIC} size="medium">
                      {ethers.utils.formatEther(totalPrice!)}
                    </Mana>
                  </div>
                </div>
              </div>
              <p className="estimate-notice">{t('publish_collection_modal_with_oracle.estimate_notice')}</p>
              <Button className="proceed" primary fluid onClick={this.handleProceed} disabled={hasInsufficientMANA || !!itemError}>
                {t('global.next')}
              </Button>
              {hasInsufficientMANA && (
                <small className="not-enough-mana-notice">
                  <T
                    id="publish_collection_modal_with_oracle.not_enough_mana"
                    values={{
                      symbol: (
                        <span>
                          <Mana network={Network.MATIC} inline /> MANA
                        </span>
                      )
                    }}
                  />
                  <br />
                  <T
                    id="publish_collection_modal_with_oracle.get_mana"
                    values={{
                      link: (
                        <a href={config.get('ACCOUNT_URL', '')} rel="noopener noreferrer" target="_blank">
                          Account
                        </a>
                      )
                    }}
                  />
                </small>
              )}
            </>
          )}
        </Modal.Content>
      </>
    )
  }

  renderSecondStep = () => {
    const { onClose } = this.props

    return (
      <>
        <ModalNavigation title={t('publish_collection_modal_with_oracle.title_tos')} onClose={onClose} />
        <Modal.Content className="second-step">
          {t('publish_collection_modal_with_oracle.first_paragraph')}
          <div className="divider"></div>
          {t('publish_collection_modal_with_oracle.second_paragraph')}
          <div className="divider"></div>
          {t('publish_collection_modal_with_oracle.third_paragraph')}
          <div className="divider"></div>
          {t('publish_collection_modal_with_oracle.fourth_paragraph')}{' '}
          <a href="https://docs.decentraland.org/wearables/publishing-wearables" rel="noopener noreferrer" target="_blank">
            {t('global.learn_more')}
          </a>
          <Button primary fluid onClick={this.handleNextStep}>
            {t('global.next')}
          </Button>
        </Modal.Content>
      </>
    )
  }

  renderThirdStep = () => {
    const { isPublishLoading, unsyncedCollectionError, collectionError, onClose } = this.props
    const { email, emailFocus } = this.state
    const hasValidEmail = emailRegex.test(email ?? '')
    const showEmailError = !hasValidEmail && !emailFocus && email !== undefined && email !== ''
    const error = unsyncedCollectionError || collectionError
    return (
      <Form onSubmit={this.handlePublish}>
        <ModalNavigation title={t('publish_collection_modal_with_oracle.title_tos')} onClose={onClose} />
        <Modal.Content className="third-step">
          <div className="tos">
            <p>{t('publish_collection_modal_with_oracle.tos_title')}</p>
            <p>
              <T
                id="publish_collection_modal_with_oracle.tos_first_condition"
                values={{
                  terms_of_use: (
                    <a href="https://decentraland.org/terms/" rel="noopener noreferrer" target="_blank">
                      {t('publish_collection_modal_with_oracle.terms_of_use')}
                    </a>
                  ),
                  content_policy: (
                    <a href="https://decentraland.org/content/" rel="noopener noreferrer" target="_blank">
                      {t('publish_collection_modal_with_oracle.content_policy')}
                    </a>
                  )
                }}
              />
            </p>
            <p>{t('publish_collection_modal_with_oracle.tos_second_condition')}</p>
            <p>{t('publish_collection_modal_with_oracle.tos_third_condition')}</p>
          </div>
          <Field
            label={t('global.email')}
            placeholder={'email@decentraland.org'}
            onFocus={this.handleEmailFocus}
            onBlur={this.handleEmailBlur}
            onChange={this.handleEmailChange}
            error={showEmailError}
            message={showEmailError ? t('publish_collection_modal_with_oracle.invalid_email') : undefined}
            value={email}
          />
        </Modal.Content>
        <Modal.Actions className="third-step-footer">
          <Button primary fluid disabled={!hasValidEmail || isPublishLoading || !!error} loading={isPublishLoading}>
            {t('global.publish')}
          </Button>
          <p>{t('publish_collection_modal_with_oracle.accept_by_publishing')}</p>
          {error && <p className="error">{t('publish_collection_modal_with_oracle.unsynced_collection')}</p>}
        </Modal.Actions>
      </Form>
    )
  }

  renderStep = () => {
    const { step } = this.state
    switch (step) {
      case 1:
        return this.renderFirstStep()
      case 2:
        return this.renderSecondStep()
      case 3:
        return this.renderThirdStep()
      default:
        throw new Error('Step not found')
    }
  }

  render() {
    const { onClose } = this.props
    const { step } = this.state

    return (
      <Modal className="PublishCollectionModal" size={step !== 1 ? 'tiny' : undefined} onClose={onClose}>
        {this.renderStep()}
      </Modal>
    )
  }
}
