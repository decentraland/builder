import * as React from 'react'
import { ModalNavigation, Button } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { setOnSale, enableSaleOffchain, isOnSale } from 'modules/collection/utils'
import { Props } from './SellCollectionModal.types'
import './SellCollectionModal.css'

export default class SellCollectionModal extends React.PureComponent<Props> {
  handleToggleOnSale = () => {
    const { collection, wallet, metadata, isOffchainPublicItemOrdersEnabled, onSetMinters } = this.props
    onSetMinters(
      collection,
      isOffchainPublicItemOrdersEnabled && !isOnSale(collection, wallet)
        ? enableSaleOffchain(collection, wallet, !metadata.isOnSale)
        : setOnSale(collection, wallet, !metadata.isOnSale),
      !isOffchainPublicItemOrdersEnabled // if isOffchainPublicItemOrdersEnabled is on, send false to avoid redirecting to activity
    )
  }

  render() {
    const { metadata, isLoading, hasUnsyncedItems, isOffchainPublicItemOrdersEnabled, onClose } = this.props
    const tKey = metadata.isOnSale ? 'remove_from_marketplace' : isOffchainPublicItemOrdersEnabled ? 'enable_sales' : 'put_for_sale'
    return (
      <Modal className="SellCollectionModal" size="tiny" onClose={isLoading ? undefined : onClose}>
        <ModalNavigation title={t(`sell_collection_modal.${tKey}.title`)} onClose={isLoading ? undefined : onClose} />
        <Modal.Content>
          {hasUnsyncedItems && <p className="unsynced-warning danger-text">{t('sell_collection_modal.unsynced_warning')}</p>}
          {t(`sell_collection_modal.${tKey}.description`)}
          <Button primary fluid onClick={this.handleToggleOnSale} loading={isLoading} disabled={isLoading}>
            {t(`sell_collection_modal.${tKey}.cta`)}
          </Button>
          <Button secondary fluid onClick={onClose} disabled={isLoading}>
            {t('global.cancel')}
          </Button>
        </Modal.Content>
      </Modal>
    )
  }
}
