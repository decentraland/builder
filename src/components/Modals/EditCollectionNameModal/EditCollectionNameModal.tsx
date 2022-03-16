import * as React from 'react'
import { ModalNavigation, ModalContent, ModalActions, Button, Field, InputOnChangeData, Form } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { CollectionType, COLLECTION_NAME_MAX_LENGTH, TP_COLLECTION_NAME_MAX_LENGTH } from 'modules/collection/types'
import { Props, State, EditCollectionNameModalMetadata } from './EditCollectionNameModal.types'
import { getCollectionType } from 'modules/collection/utils'

export default class EditCollectionNameModal extends React.PureComponent<Props, State> {
  state: State = {
    name: (this.props.metadata as EditCollectionNameModalMetadata).collection.name
  }

  handleNameChange = (_event: React.ChangeEvent<HTMLInputElement>, { value }: InputOnChangeData) => {
    const nameMaxLength =
      getCollectionType(this.props.metadata.collection) === CollectionType.THIRD_PARTY
        ? TP_COLLECTION_NAME_MAX_LENGTH
        : COLLECTION_NAME_MAX_LENGTH
    this.setState({ name: value.slice(0, nameMaxLength) })
  }

  handleSubmit = () => {
    const { name } = this.state
    const { metadata, onSubmit } = this.props
    const { collection } = metadata as EditCollectionNameModalMetadata
    if (name) {
      onSubmit({ ...collection, name })
    }
  }

  render() {
    const { name: modalName, onClose, isLoading } = this.props
    const { name } = this.state
    return (
      <Modal name={modalName} onClose={onClose} size="tiny">
        <ModalNavigation
          title={t('edit_collection_name_modal.title')}
          subtitle={t('edit_collection_name_modal.subtitle')}
          onClose={onClose}
        />
        <Form onSubmit={this.handleSubmit}>
          <ModalContent>
            <Field label={t('global.name')} value={name} onChange={this.handleNameChange} />
          </ModalContent>
          <ModalActions>
            <Button primary loading={isLoading} disabled={!name}>
              {t('global.save')}
            </Button>
          </ModalActions>
        </Form>
      </Modal>
    )
  }
}
