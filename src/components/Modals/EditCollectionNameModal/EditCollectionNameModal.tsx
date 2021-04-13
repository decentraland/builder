import * as React from 'react'
import { ModalNavigation, ModalContent, ModalActions, Button, Field, InputOnChangeData, Form } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { COLLECTION_NAME_MAX_LENGTH } from 'modules/collection/types'
import { Props, State, EditCollectionNameModalMetadata } from './EditCollectionNameModal.types'

export default class EditCollectionNameModal extends React.PureComponent<Props, State> {
  state: State = {
    name: (this.props.metadata as EditCollectionNameModalMetadata).collection.name
  }

  handleNameChange = (_event: React.ChangeEvent<HTMLInputElement>, { value }: InputOnChangeData) => {
    this.setState({ name: value.slice(0, COLLECTION_NAME_MAX_LENGTH) })
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
              {t('edit_collection_name_modal.submit')}
            </Button>
          </ModalActions>
        </Form>
      </Modal>
    )
  }
}
