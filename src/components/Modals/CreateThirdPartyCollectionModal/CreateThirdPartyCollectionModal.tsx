import * as React from 'react'
import slug from 'slug'
import {
  ModalNavigation,
  Button,
  Form,
  Field,
  ModalContent,
  ModalActions,
  InputOnChangeData,
  SelectField,
  DropdownProps
} from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { Collection, COLLECTION_NAME_MAX_LENGTH } from 'modules/collection/types'
import { Props, State } from './CreateThirdPartyCollectionModal.types'

export default class CreateThirdPartyCollectionModal extends React.PureComponent<Props, State> {
  state: State = {
    thirdPartyId: '',
    collectionName: '',
    urnSuffix: '',
    isTypedUrnSuffix: false
  }

  handleSubmit = () => {
    const { address, onSubmit } = this.props
    const { collectionName, urnSuffix } = this.state

    if (collectionName && urnSuffix) {
      const now = Date.now()
      const thirdParty = this.getSelectedThirdParty()
      const collection: Collection = {
        id: thirdParty.id,
        name: collectionName,
        owner: address!,
        urnSuffix: urnSuffix,
        isPublished: false,
        isApproved: false,
        minters: [],
        managers: [],
        reviewedAt: now,
        createdAt: now,
        updatedAt: now
      }
      onSubmit(collection)
    }
  }

  handleIdChange = (_: React.SyntheticEvent, data: DropdownProps) => {
    if (data.value) {
      this.setState({ thirdPartyId: data.value.toString() })
    }
  }

  handleNameChange = (_event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
    const { urnSuffix, isTypedUrnSuffix } = this.state
    const collectionName = data.value.slice(0, COLLECTION_NAME_MAX_LENGTH)
    const newUrnSuffix = isTypedUrnSuffix ? urnSuffix : slug(collectionName)
    this.setState({ collectionName, urnSuffix: newUrnSuffix })
  }

  handleUrnSuffixChange = (_event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
    this.setState({ urnSuffix: slug(data.value), isTypedUrnSuffix: !!data.value })
  }

  getSelectedThirdParty() {
    const { thirdParties } = this.props
    const { thirdPartyId } = this.state
    return thirdParties.find(thirdParty => thirdParty.id === thirdPartyId) || thirdParties[0]
  }

  render() {
    const { name, thirdParties, onClose, isLoading } = this.props
    const { collectionName, urnSuffix } = this.state
    const isDisabled = !collectionName || isLoading

    // Check for repeated urnSuffix error

    const selectedThirdParty = this.getSelectedThirdParty()

    return (
      <Modal name={name} onClose={onClose} size="tiny">
        <ModalNavigation
          title={t('create_third_party_collection_modal.title')}
          subtitle={t('create_third_party_collection_modal.subtitle')}
          onClose={onClose}
        />
        <Form onSubmit={this.handleSubmit} disabled={isDisabled}>
          <ModalContent>
            <SelectField
              label={t('create_third_party_collection_modal.third_party.label')}
              options={thirdParties.map(thirdParty => ({ value: thirdParty.id, text: thirdParty.name }))}
              onChange={this.handleIdChange}
              value={selectedThirdParty.id}
            />
            <Field
              label={t('create_third_party_collection_modal.name_field.label')}
              placeholder={t('create_third_party_collection_modal.name_field.placeholder')}
              value={collectionName}
              onChange={this.handleNameChange}
            />
            <Field
              label={t('create_third_party_collection_modal.urn_suffix_field.label')}
              placeholder={t('create_third_party_collection_modal.urn_suffix_field.placeholder')}
              value={urnSuffix}
              onChange={this.handleUrnSuffixChange}
            />
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
