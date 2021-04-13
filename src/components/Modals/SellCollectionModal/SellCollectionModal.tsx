import * as React from 'react'
import { ModalNavigation, Button } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { setOnSale } from 'modules/collection/utils'
import { Props } from './SellCollectionModal.types'
import './SellCollectionModal.css'

export default class SellCollectionModal extends React.PureComponent<Props> {
  handleSell = () => {
    const { collection, wallet, metadata, onSetMinters } = this.props
    onSetMinters(collection, setOnSale(collection, wallet, metadata.isOnSale))
  }

  render() {
    const { metadata, isLoading, onClose } = this.props
    return (
      <Modal className="SellCollectionModal" size="tiny" onClose={onClose}>
        <ModalNavigation title={t('sell_collection_modal.title')} onClose={onClose} />
        <Modal.Content>
          {metadata.isOnSale ? (
            <>
              {t('sell_collection_modal.turn_on_description')}
              <Button primary fluid onClick={this.handleSell} loading={isLoading}>
                {t('sell_collection_modal.turn_on')}
              </Button>
            </>
          ) : (
            <>
              {t('sell_collection_modal.turn_off_description')}
              <Button primary fluid onClick={this.handleSell} loading={isLoading}>
                {t('sell_collection_modal.turn_off')}
              </Button>
            </>
          )}
          <Button secondary fluid onClick={onClose}>
            {t('global.cancel')}
          </Button>
        </Modal.Content>
      </Modal>
    )
  }
}
