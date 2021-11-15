import * as React from 'react'
import { ModalNavigation, ModalContent, ModalActions, Button, Field, InputOnChangeData, Form } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { buildThirdPartyURN, DecodedURN, decodeURN, URNType } from 'lib/urn'
import { Item } from 'modules/item/types'
import { Collection } from 'modules/collection/types'
import { Props, State, EditURNModalMetadata } from './EditURNModal.types'

export default class EditURNModal extends React.PureComponent<Props, State> {
  decodedURN: DecodedURN<URNType.COLLECTIONS_THIRDPARTY> = this.decodeURN()

  state: State = {
    newURNSection: ''
  }

  handleURNChange = (_event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
    this.setState({ newURNSection: data.value })
  }

  handleSubmit = () => {
    const { collection, item, onSaveCollection, onSaveItem } = this.props
    const urn = this.getUpdatedURN()

    if (this.isItem()) {
      onSaveItem({ ...item, urn } as Item, {})
    } else {
      onSaveCollection({ ...collection, urn } as Collection)
    }
  }

  getUpdatedURN() {
    const { metadata } = this.props
    const { newURNSection } = this.state
    const { urn } = metadata

    let newThirdPartyCollectionId = this.decodedURN.thirdPartyCollectionId!
    let newThirdPartyTokenId = this.decodedURN.thirdPartyTokenId

    if (!newURNSection) {
      return urn
    }

    if (this.isItem()) {
      newThirdPartyTokenId = newURNSection
    } else {
      newThirdPartyCollectionId = newURNSection
    }

    return buildThirdPartyURN(this.decodedURN.thirdPartyName, newThirdPartyCollectionId, newThirdPartyTokenId)
  }

  isItem() {
    return !!this.props.item
  }

  getName() {
    const { collection, item } = this.props
    return this.isItem() ? item!.name : collection!.name
  }

  decodeURN() {
    const { urn } = this.props.metadata as EditURNModalMetadata
    const decodedURN = decodeURN(urn)
    if (decodedURN.type !== URNType.COLLECTIONS_THIRDPARTY) {
      throw new Error(`Invalid URN type ${this.decodedURN.type}`)
    }
    return decodedURN
  }

  render() {
    const { name, onClose, isLoading } = this.props
    const { newURNSection } = this.state

    return (
      <Modal name={name} onClose={onClose} size="tiny">
        <ModalNavigation
          title={t('edit_urn_modal.title')}
          subtitle={t('edit_urn_modal.subtitle', { name: this.getName() })}
          onClose={onClose}
        />
        <Form onSubmit={this.handleSubmit}>
          <ModalContent>
            <Field label={t('global.urn')} message={this.getUpdatedURN()} value={newURNSection} onChange={this.handleURNChange} />
          </ModalContent>
          <ModalActions>
            <Button primary loading={isLoading} disabled={!newURNSection}>
              {t('global.save')}
            </Button>
          </ModalActions>
        </Form>
      </Modal>
    )
  }
}
