import * as React from 'react'
import { Props, State, AddExistingItemModalMetadata } from './AddExistingItemModal.types'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { ModalNavigation, ModalContent, ModalActions, Button } from 'decentraland-ui'
import ItemDropdown from 'components/ItemDropdown'

export default class AddExistingItemModal extends React.PureComponent<Props, State> {
  state: State = {}
  render() {
    const { name, onClose, onSubmit, metadata } = this.props
    const { collectionId } = metadata as AddExistingItemModalMetadata
    const { item } = this.state
    return (
      <Modal name={name} onClose={onClose} size="tiny">
        <ModalNavigation title="Add Existing Item" onClose={onClose} />
        <ModalContent>
          <ItemDropdown value={item} onChange={item => this.setState({ item })} filter={item => !item.collectionId} />
        </ModalContent>
        <ModalActions>
          <Button primary onClick={() => item && onSubmit(item, collectionId)}>
            Add
          </Button>
        </ModalActions>
      </Modal>
    )
  }
}
