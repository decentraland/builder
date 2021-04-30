import * as React from 'react'
import { ModalNavigation, Button, Mana, Loader } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { builder } from 'lib/api/builder'
import { fromWei } from 'web3x-es/utils'
import { ItemRarity } from 'modules/item/types'
import { getBackgroundStyle } from 'modules/item/utils'
import { Props, State } from './PublishCollectionModal.types'
import './PublishCollectionModal.css'

export default class PublishCollectionModal extends React.PureComponent<Props, State> {
  state: State = { step: 1, rarities: [], isFetchingRarities: true }

  async componentDidMount() {
    const { collection, onClose } = this.props
    if (!collection) {
      onClose()
    }

    const rarities = await builder.fetchRarities()
    this.setState({ rarities, isFetchingRarities: false })
  }

  handlePublish = () => {
    const { collection, items, onPublish } = this.props
    onPublish(collection!, items)
  }

  handleProceed = () => {
    this.setState({ step: 2 })
  }

  renderFirstStep = () => {
    const { items } = this.props
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

    return (
      <>
        {isFetchingRarities ? (
          <div className="loader-wrapper">
            <Loader size="big" active={isFetchingRarities} />
          </div>
        ) : (
          <>
            {t('publish_collection_modal.items_breakdown_title', { items: items.length })}
            <div className="items-breakdown">
              {Object.values(itemsByRarity).map(itemByRarity => (
                <div className="item" key={itemByRarity.name}>
                  <div>
                    <i className="item-rarity" style={getBackgroundStyle(itemByRarity.id)}></i>
                    {itemByRarity.count} {itemByRarity.name}
                  </div>
                  <div>
                    <Mana>{itemByRarity.price}</Mana>
                  </div>
                </div>
              ))}
              <div className="item total">
                <div>{t('global.total')}</div>
                <div>
                  <Mana>{totalPrice}</Mana>
                </div>
              </div>
            </div>
            <Button className="proceed" primary fluid onClick={this.handleProceed}>
              {t('global.proceed')}
            </Button>
          </>
        )}
      </>
    )
  }

  renderSecondStep = () => {
    const { isLoading } = this.props

    return (
      <>
        {t('publish_collection_modal.first_paragraph')}
        <div className="divider"></div>
        {t('publish_collection_modal.second_paragraph')}
        <div className="divider"></div>
        {t('publish_collection_modal.third_paragraph')}
        <Button primary fluid onClick={this.handlePublish} loading={isLoading}>
          {t('publish_collection_modal.publish')}
        </Button>
      </>
    )
  }

  render() {
    const { onClose } = this.props
    const { step } = this.state
    return (
      <Modal className="PublishCollectionModal" size="tiny" onClose={onClose}>
        <ModalNavigation title={t('publish_collection_modal.title')} onClose={onClose} />
        <Modal.Content>{step === 1 ? this.renderFirstStep() : this.renderSecondStep()}</Modal.Content>
      </Modal>
    )
  }
}
