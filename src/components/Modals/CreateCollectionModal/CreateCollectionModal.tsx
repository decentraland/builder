import * as React from 'react'
import uuid from 'uuid'
import { ModalNavigation, Button, Form, Field, ModalContent, ModalActions, InputOnChangeData } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { Collection, COLLECTION_NAME_MAX_LENGTH } from 'modules/collection/types'
import { Props, State } from './CreateCollectionModal.types'

export default class CreateCollectionModal extends React.PureComponent<Props, State> {
  state: State = {
    collectionName: ''
  }

  handleSubmit = () => {
    const { address, onSubmit } = this.props
    const { collectionName } = this.state
    if (collectionName) {
      const now = Date.now()
      const collection: Collection = {
        id: uuid.v4(),
        name: collectionName,
        owner: address!,
        isPublished: false,
        isApproved: false,
        minters: [],
        managers: [],
        lock: undefined,
        reviewedAt: now,
        createdAt: now,
        updatedAt: now
      }
      onSubmit(collection)
    }
  }

  handleNameChange = (_event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
    this.setState({ collectionName: data.value.slice(0, COLLECTION_NAME_MAX_LENGTH) })
  }

  render() {
    const { name, onClose, isLoading, error } = this.props
    const { collectionName } = this.state
    const isDisabled = !collectionName || isLoading

    let errorMessage = error
    if (error === 'Name already in use') {
      errorMessage = t('create_collection_modal.error_name_already_in_use')
    }

    return (
      <Modal name={name} onClose={onClose} size="tiny">
        <ModalNavigation title={t('create_collection_modal.title')} subtitle={t('create_collection_modal.subtitle')} onClose={onClose} />
        <Form onSubmit={this.handleSubmit} disabled={isDisabled}>
          <ModalContent>
            <Field
              label={t('create_collection_modal.label')}
              placeholder={t('create_collection_modal.placeholder')}
              value={collectionName}
              onChange={this.handleNameChange}
              error={!!errorMessage}
              message={errorMessage ? errorMessage : ''}
            ></Field>
          </ModalContent>
          <ModalActions>
            <Button primary disabled={isDisabled} loading={isLoading}>
              {t('global.create')}
            </Button>
          </ModalActions>
        </Form>
      </Modal>
    )
  }
}
