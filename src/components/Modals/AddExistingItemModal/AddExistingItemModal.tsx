import * as React from 'react'
import { ModalNavigation, ModalContent, ModalActions, Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { Item } from 'modules/item/types'
import ItemDropdown from 'components/ItemDropdown'
import { Props, State, AddExistingItemModalMetadata } from './AddExistingItemModal.types'

export default class AddExistingItemModal extends React.PureComponent<Props, State> {
  state: State = {}

  handleChangeItem = (item: Item) => {
    this.setState({ item })
  }

  render() {
    const { name, onClose, onSubmit, metadata, isLoading } = this.props
    const { collectionId } = metadata as AddExistingItemModalMetadata
    const { item } = this.state
    return (
      <Modal name={name} onClose={onClose} size="tiny">
        <ModalNavigation title={t('add_existing_item_modal.title')} subtitle={t('add_existing_item_modal.subtitle')} onClose={onClose} />
        <ModalContent>
          <ItemDropdown value={item} onChange={this.handleChangeItem} filter={item => !item.collectionId} />
        </ModalContent>
        <ModalActions>
          <Button primary onClick={() => item && onSubmit(item, collectionId)} loading={isLoading} disabled={!item}>
            {t('add_existing_item_modal.add')}
          </Button>
        </ModalActions>
      </Modal>
    )
  }
}
