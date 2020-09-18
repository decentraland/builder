import * as React from 'react'
import uuid from 'uuid'
import { ModalNavigation, Button, Field, ModalContent, ModalActions } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { Props, State } from './CreateCollectionModal.types'
import './CreateCollectionModal.css'
import { Collection } from 'modules/collection/types'

export default class CreateItemModal extends React.PureComponent<Props, State> {
  state: State = {
    collectionName: ''
  }

  handleSubmit = () => {
    const { address, onSubmit } = this.props
    const { collectionName } = this.state
    if (collectionName) {
      const collection: Collection = {
        id: uuid.v4(),
        name: collectionName,
        owner: address!,
        isPublished: false,
        minters: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      onSubmit(collection)
    }
  }

  render() {
    const { name, onClose, isLoading } = this.props
    const { collectionName } = this.state
    return (
      <Modal name={name} onClose={onClose} size="tiny">
        <ModalNavigation title={t('create_collection_modal.title')} subtitle={t('create_collection_modal.subtitle')} onClose={onClose} />
        <ModalContent>
          <Field
            label={t('create_collection_modal.label')}
            placeholder={t('create_collection_modal.placeholder')}
            value={collectionName}
            onChange={(_event, props) => this.setState({ collectionName: props.value })}
          ></Field>
        </ModalContent>
        <ModalActions>
          <Button primary disabled={!collectionName || isLoading} loading={isLoading} onClick={this.handleSubmit}>
            {t('global.create')}
          </Button>
        </ModalActions>
      </Modal>
    )
  }
}
