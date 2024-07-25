import { useState, useMemo, useCallback, FC, SyntheticEvent } from 'react'
import { Collection, TP_COLLECTION_NAME_MAX_LENGTH } from 'modules/collection/types'
import {
  ModalNavigation,
  Button,
  Form,
  Field,
  ModalContent,
  ModalActions,
  SelectField,
  InputOnChangeData,
  DropdownProps
} from 'decentraland-ui'
import uuid from 'uuid'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics'
import { buildThirdPartyURN, decodeURN, getDefaultThirdPartyUrnSuffix } from 'lib/urn'
import { Props } from './CreateThirdPartyCollectionModal.types'

export const CreateThirdPartyCollectionModal: FC<Props> = (props: Props) => {
  const { name, thirdParties, onClose, isCreatingCollection, isThirdPartyV2Enabled, error, ownerAddress, onSubmit, onBack } = props
  const [collectionName, setCollectionName] = useState('')
  const [hasCollectionIdBeenTyped, setHasCollectionIdBeenTyped] = useState(false)
  const [collectionId, setCollectionId] = useState('')
  const [thirdPartyId, setThirdPartyId] = useState(thirdParties[0].id)
  const analytics = getAnalytics()

  const selectedThirdParty = useMemo(() => {
    return thirdParties.find(thirdParty => thirdParty.id === thirdPartyId) || thirdParties[0]
  }, [thirdParties, thirdPartyId])
  const thirdPartyOptions = useMemo(() => thirdParties.map(thirdParty => ({ value: thirdParty.id, text: thirdParty.name })), [thirdParties])
  const isCollectionNameInvalid = useMemo(() => collectionName.includes(':'), [collectionName])

  const handleNameChange = useCallback(
    (_: SyntheticEvent, data: InputOnChangeData) => {
      setCollectionName(data.value)
      setCollectionId(hasCollectionIdBeenTyped ? collectionId : getDefaultThirdPartyUrnSuffix(data.value))
    },
    [setCollectionName, hasCollectionIdBeenTyped, collectionId]
  )
  const handleThirdPartyChange = useCallback(
    (_: React.SyntheticEvent, data: DropdownProps) => {
      if (data.value) {
        setThirdPartyId(data.value.toString())
      }
    },
    [setThirdPartyId]
  )
  const handleCollectionIdChange = useCallback(
    (_event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
      setCollectionId(data.value)
      setHasCollectionIdBeenTyped(!!data.value)
    },
    [setCollectionId, setHasCollectionIdBeenTyped]
  )

  const handleSubmit = useCallback(() => {
    if (collectionName && ownerAddress && collectionId) {
      const now = Date.now()
      const decodedURN = decodeURN(selectedThirdParty.id)
      const urn = buildThirdPartyURN(decodedURN.suffix, collectionId)
      const collection: Collection = {
        id: uuid.v4(),
        name: collectionName,
        owner: ownerAddress,
        urn,
        isPublished: false,
        isApproved: false,
        minters: [],
        managers: [],
        createdAt: now,
        updatedAt: now
      }
      onSubmit(collection)
      analytics.track('Create TP Collection', {
        collectionId: collection.id,
        thirdPartyId: selectedThirdParty.id,
        collectionName
      })
    }
  }, [onSubmit, collectionId, collectionName, selectedThirdParty, ownerAddress, analytics])

  const isSubmittable = collectionName && ownerAddress && !isCollectionNameInvalid && collectionId
  !isCreatingCollection
  const isLoading = isCreatingCollection

  return (
    <Modal name={name} onClose={isLoading ? undefined : onClose} size="small">
      <ModalNavigation
        title={t('create_linked_wearable_collection_modal.title')}
        subtitle={t('create_linked_wearable_collection_modal.subtitle')}
        onClose={isLoading ? undefined : onClose}
        onBack={isLoading ? undefined : onBack}
      />
      <Form onSubmit={handleSubmit} disabled={!isSubmittable}>
        <ModalContent>
          <SelectField
            label={t('create_linked_wearable_collection_modal.third_party_field.label')}
            options={thirdPartyOptions}
            onChange={handleThirdPartyChange}
            disabled={isLoading}
            value={selectedThirdParty.id}
          />
          <Field
            label={t('create_linked_wearable_collection_modal.name_field.label')}
            placeholder="aName"
            value={collectionName}
            maxLength={TP_COLLECTION_NAME_MAX_LENGTH}
            onChange={handleNameChange}
            error={isCollectionNameInvalid}
            message={isCollectionNameInvalid ? t('create_linked_wearable_collection_modal.name_field.message') : ''}
            disabled={isLoading}
          />
          {!isThirdPartyV2Enabled && (
            <Field
              label={t('create_linked_wearable_collection_modal.collection_id_field.label')}
              placeholder="0x..."
              message={t('create_linked_wearable_collection_modal.collection_id_field.message')}
              value={collectionId}
              onChange={handleCollectionIdChange}
            />
          )}
          {error ? <small className="danger-text">{error}</small> : null}
        </ModalContent>
        <ModalActions>
          <Button primary disabled={!isSubmittable} loading={isLoading}>
            {t('global.create')}
          </Button>
        </ModalActions>
      </Form>
    </Modal>
  )
}
