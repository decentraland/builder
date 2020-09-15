import * as React from 'react'
import { ModalNavigation, ModalActions, Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'

import MinteableItem from './MinteableItem'
import { Props } from './MintItemsModal.types'
import './MintItemsModal.css'

export default class MintItemsModal extends React.PureComponent<Props> {
  handleMintItems = () => {
    console.log('MintIems')
    this.props.onClose()
  }

  handleAddItems = () => {
    console.log('AddItems')
    this.props.onClose()
  }

  render() {
    const { items, onClose } = this.props
    return (
      <Modal name={name} className="MintItemsModal" onClose={onClose}>
        <ModalNavigation title={t('mint_items_modal.title')} onClose={onClose} />
        <Modal.Content>
          {items.map(item => (
            <MinteableItem key={item.id} item={item} />
          ))}
          <div className="add-item link" onClick={this.handleAddItems}>
            {t('mint_items_modal.add_item')}
          </div>
          <ModalActions>
            <Button primary onClick={this.handleMintItems}>
              {t('global.done')}
            </Button>
          </ModalActions>
        </Modal.Content>
      </Modal>
    )
  }
}
