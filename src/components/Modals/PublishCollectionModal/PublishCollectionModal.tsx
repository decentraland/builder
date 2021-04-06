import * as React from 'react'
import { ModalNavigation, Button, Mana } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { builder } from 'lib/api/builder'
import { fromWei } from 'web3x-es/utils'
import { Props, State } from './PublishCollectionModal.types'
import './PublishCollectionModal.css'

export default class PublishCollectionModal extends React.PureComponent<Props, State> {
  state: State = { rarities: [] }

  async componentDidMount() {
    const { collection, onClose } = this.props
    if (!collection) {
      onClose()
    }

    const rarities = await builder.fetchRarities()
    this.setState({ rarities })
  }

  handlePublish = () => {
    const { collection, items, onPublish } = this.props
    onPublish(collection!, items)
  }

  renderRaritiesBreakdown = () => {
    const { items } = this.props
    const { rarities } = this.state

    let price = 0

    return rarities.length ? (
      <div className="items-breakdown">
        {items.map(item => {
          const rarity = rarities.find(r => r.name === item.rarity)!
          const rarityPrice = fromWei(rarity.price, 'ether')
          price += parseInt(rarityPrice, 10)
          return (
            <p>
              {item.name} - {item.rarity} <Mana>{rarityPrice}</Mana>
            </p>
          )
        })}
        <p>Total: ${price}</p>
      </div>
    ) : null
  }

  render() {
    const { isLoading, onClose, items } = this.props
    const raritiesBreakdown = this.renderRaritiesBreakdown()
    return (
      <Modal className="PublishCollectionModal" size="tiny" onClose={onClose}>
        <ModalNavigation title={t('publish_collection_modal.title')} onClose={onClose} />
        <Modal.Content>
          {t('publish_collection_modal.first_paragraph')}
          <div className="divider"></div>
          {t('publish_collection_modal.second_paragraph')}
          <div className="divider"></div>
          {t('publish_collection_modal.third_paragraph')}
          <div className="divider"></div>
          {t('publish_collection_modal.fourth_paragraph', { items: items.length })}
          {raritiesBreakdown}
          <Button primary fluid onClick={this.handlePublish} loading={isLoading}>
            {t('publish_collection_modal.publish')}
          </Button>
        </Modal.Content>
      </Modal>
    )
  }
}
