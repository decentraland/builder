import * as React from 'react'
import { Network } from '@dcl/schemas'
import { env } from 'decentraland-commons'
import { ModalNavigation, Button, Mana, Loader, Field, InputOnChangeData } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'

import { builder } from 'lib/api/builder'
import { fromWei } from 'web3x-es/utils'
import { ItemRarity } from 'modules/item/types'
import { getBackgroundStyle } from 'modules/item/utils'
import { Props, State } from './PublishCollectionModal.types'
import './PublishCollectionModal.css'
import { emailRegex } from 'lib/validators'

export default class PublishCollectionModal extends React.PureComponent<Props, State> {
  state: State = { step: 1, rarities: [], isFetchingRarities: true, email: undefined, emailFocus: false }

  async componentDidMount() {
    const { collection, onClose } = this.props
    if (!collection) {
      onClose()
    }

    const rarities = await builder.fetchRarities()
    this.setState({ rarities, isFetchingRarities: false })
  }

  // TODO: rename this
  handleNextStep = () => {
    this.setState({ step: 3 })
  }

  handlePublish = () => {
    const { collection, items, onPublish } = this.props
    onPublish(collection!, items)
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
    const { items, wallet, onClose } = this.props
    const { rarities, isFetchingRarities } = this.state

    const itemsByRarity: Record<string, { id: ItemRarity; name: ItemRarity; count: number; price: number }> = {}
    let totalPrice = 0

    for (const item of items) {
      const rarity = rarities.find(rarity => rarity.name === item.rarity)

      if (!rarity) {
        continue
      }

      if (!itemsByRarity[rarity.id]) {
        itemsByRarity[rarity.id] = { id: rarity.id, name: rarity.name, count: 0, price: 0 }
      }

      const rarityPrice = parseInt(fromWei(rarity.price, 'ether'), 10)
      itemsByRarity[rarity.name].count++
      itemsByRarity[rarity.name].price += rarityPrice
      totalPrice += rarityPrice
    }

    const hasInsufficientMANA = !!wallet && wallet.networks.MATIC.mana < totalPrice

    return (
      <>
        <ModalNavigation title={t('publish_collection_modal.title')} onClose={onClose} />
        <Modal.Content className="first-step">
          {isFetchingRarities ? (
            <div className="loader-wrapper">
              <Loader size="big" active={isFetchingRarities} />
            </div>
          ) : (
            <>
              {t('publish_collection_modal.items_breakdown_title', { count: items.length })}
              <div className="items-breakdown">
                {Object.values(itemsByRarity).map(itemByRarity => (
                  <div className="item" key={itemByRarity.name}>
                    <div>
                      <i className="item-rarity" style={getBackgroundStyle(itemByRarity.id)}></i>
                      {itemByRarity.count} {itemByRarity.name}
                    </div>
                    <div>
                      <Mana network={Network.MATIC}>{itemByRarity.price}</Mana>
                    </div>
                  </div>
                ))}
                <div className="item total">
                  <div>{t('global.total')}</div>
                  <div>
                    <Mana network={Network.MATIC}>{totalPrice}</Mana>
                  </div>
                </div>
              </div>
              <Button className="proceed" primary fluid onClick={this.handleProceed}>
                {t('global.next')}
              </Button>
              {hasInsufficientMANA ? (
                <small className="not-enough-mana-notice">
                  <T
                    id="publish_collection_modal.not_enogh_mana"
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
                    id="publish_collection_modal.get_mana"
                    values={{
                      link: (
                        <a href={env.get('REACT_APP_ACCOUNT_URL', '')} rel="noopener noreferrer" target="_blank">
                          Account
                        </a>
                      )
                    }}
                  />
                </small>
              ) : null}
            </>
          )}
        </Modal.Content>
      </>
    )
  }

  renderSecondStep = () => {
    const { isLoading, onClose } = this.props

    return (
      <>
        <ModalNavigation title={t('publish_collection_modal.title_tos')} onClose={onClose} />
        <Modal.Content className="second-step">
          {t('publish_collection_modal.first_paragraph')}
          <div className="divider"></div>
          {t('publish_collection_modal.second_paragraph')}
          <div className="divider"></div>
          {t('publish_collection_modal.third_paragraph')}{' '}
          <a href="https://docs.decentraland.org/wearables/publishing-wearables" rel="noopener noreferrer" target="_blank">
            {t('global.learn_more')}
          </a>
          <Button primary fluid onClick={this.handleNextStep} loading={isLoading}>
            {t('global.next')}
          </Button>
        </Modal.Content>
      </>
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
        return this.renderThridStep()
      default:
        throw new Error('Step not found')
    }
  }

  renderThridStep = () => {
    const { isLoading, onClose } = this.props
    const { email, emailFocus } = this.state
    const hasValidEmail = emailRegex.test(email ?? '')
    const showEmailError = !hasValidEmail && !emailFocus && email !== undefined && email !== ''

    return (
      <>
        <ModalNavigation title={t('publish_collection_modal.title_tos')} onClose={onClose} />
        <Modal.Content className="third-step">
          <div className="tos">
            <p>{t('publish_collection_modal.tos_title')}</p>
            <p>
              <T
                id="publish_collection_modal.tos_first_condition"
                values={{
                  terms_of_use: (
                    <a href="https://docs.decentraland.org/wearables/publishing-wearables" rel="noopener noreferrer" target="_blank">
                      {t('publish_collection_modal.terms_of_use')}
                    </a>
                  ),
                  content_policy: (
                    <a href="https://docs.decentraland.org/wearables/publishing-wearables" rel="noopener noreferrer" target="_blank">
                      {t('publish_collection_modal.content_policy')}
                    </a>
                  )
                }}
              />
            </p>
            <p>{t('publish_collection_modal.tos_second_condition')}</p>
            <p>{t('publish_collection_modal.tos_third_condition')}</p>
          </div>
          <Field
            label={t('global.email')}
            placeholder={'email@decentraland.org'}
            onFocus={this.handleEmailFocus}
            onBlur={this.handleEmailBlur}
            onChange={this.handleEmailChange}
            error={showEmailError}
            message={showEmailError ? t('publish_collection_modal.invalid_email') : undefined}
            value={email}
          />
        </Modal.Content>
        <Modal.Actions className="third-step-footer">
          <Button primary fluid onClick={this.handlePublish} disabled={!hasValidEmail} loading={isLoading}>
            {t('publish_collection_modal.publish')}
          </Button>
          <p>{t('publish_collection_modal.accept_by_publishing')}</p>
        </Modal.Actions>
      </>
    )
  }

  render() {
    const { onClose } = this.props

    return (
      <Modal className="PublishCollectionModal" size="tiny" onClose={onClose}>
        {this.renderStep()}
      </Modal>
    )
  }
}
