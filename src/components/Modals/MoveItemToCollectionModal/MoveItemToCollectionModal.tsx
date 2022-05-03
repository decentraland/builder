import * as React from 'react'
import { ModalNavigation, ModalContent, ModalActions, Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { Props, State, MoveItemToCollectionModallMetadata } from './MoveItemToCollectionModal.types'
import { Collection } from 'modules/collection/types'
import CollectionDropdown from 'components/CollectionDropdown'
import { isTPCollection } from 'modules/collection/utils'

export default class MoveItemToCollectionModal extends React.PureComponent<Props, State> {
  state: State = {}

  handleChangeCollection = (collection: Collection) => {
    this.setState({ collection })
  }

  render() {
    const { name, onClose, onSubmit, metadata, isLoading } = this.props
    const { item } = metadata as MoveItemToCollectionModallMetadata
    const { collection } = this.state
    return (
      <Modal name={name} onClose={onClose} size="tiny">
        <ModalNavigation
          title={t('move_item_to_collection_modal.title')}
          subtitle={t('move_item_to_collection_modal.subtitle')}
          onClose={onClose}
        />
        <ModalContent>
          <CollectionDropdown
            value={collection}
            onChange={this.handleChangeCollection}
            filter={collection => !isTPCollection(collection)}
          />
        </ModalContent>
        <ModalActions>
          <Button primary onClick={() => collection && onSubmit(item, collection.id)} loading={isLoading} disabled={!item}>
            {t('move_item_to_collection_modal.confirm')}
          </Button>
        </ModalActions>
      </Modal>
    )
  }
}
