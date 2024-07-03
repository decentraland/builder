import { useState, useMemo, useCallback, FC, SyntheticEvent } from 'react'
import slug from 'slug'
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
import { LinkedContract, ThirdPartyVersion } from 'modules/thirdParty/types'
import { LinkedContractProtocol, buildThirdPartyURN, buildThirdPartyV2URN, decodeURN } from 'lib/urn'
import { getThirdPartyVersion } from 'modules/thirdParty/utils'
import ethereumSvg from '../../../icons/ethereum.svg'
import polygonSvg from '../../../icons/polygon.svg'
import { Props } from './CreateLinkedWearablesCollectionModal.types'
import styles from './CreateLinkedWearablesCollectionModal.module.css'

const imgSrcByNetwork = {
  [LinkedContractProtocol.MAINNET]: ethereumSvg,
  [LinkedContractProtocol.MATIC]: polygonSvg,
  [LinkedContractProtocol.SEPOLIA]: ethereumSvg,
  [LinkedContractProtocol.AMOY]: polygonSvg
}

export const CreateLinkedWearablesCollectionModal: FC<Props> = (props: Props) => {
  const { name, thirdParties, onClose, isCreatingCollection, error, ownerAddress, onSubmit } = props
  const [collectionName, setCollectionName] = useState('')
  const [linkedContract, setLinkedContract] = useState<LinkedContract>()
  const [hasCollectionIdBeenTyped, setHasCollectionIdBeenTyped] = useState(false)
  const [collectionId, setCollectionId] = useState('')
  const [thirdPartyId, setThirdPartyId] = useState(thirdParties[0].id)
  const analytics = getAnalytics()

  const selectedThirdParty = useMemo(() => {
    return thirdParties.find(thirdParty => thirdParty.id === thirdPartyId) || thirdParties[0]
  }, [thirdParties, thirdPartyId])
  const selectedThirdPartyVersion = useMemo(
    () => (selectedThirdParty ? getThirdPartyVersion(selectedThirdParty) : undefined),
    [selectedThirdParty, getThirdPartyVersion]
  )
  const thirdPartyOptions = useMemo(() => thirdParties.map(thirdParty => ({ value: thirdParty.id, text: thirdParty.name })), [thirdParties])
  const linkedContractsOptions = useMemo(
    () =>
      selectedThirdParty?.contracts.map((contract, index) => ({
        value: index,
        key: index,
        image: imgSrcByNetwork[contract.network],
        text: contract.address
      })),
    [selectedThirdParty, imgSrcByNetwork]
  )

  const handleNameChange = useCallback(
    (_: SyntheticEvent, data: InputOnChangeData) => {
      setCollectionName(data.value)
      setCollectionId(hasCollectionIdBeenTyped ? collectionId : slug(data.value))
    },
    [setCollectionName, hasCollectionIdBeenTyped, collectionId]
  )
  const handleThirdPartyChange = useCallback(
    (_: React.SyntheticEvent, data: DropdownProps) => {
      if (data.value) {
        setLinkedContract(undefined)
        setThirdPartyId(data.value.toString())
      }
    },
    [setThirdPartyId, setLinkedContract]
  )
  const handleLinkedContractChange = useCallback(
    (_: SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
      setLinkedContract(selectedThirdParty.contracts[data.value as number])
    },
    [selectedThirdParty, setLinkedContract]
  )
  const handleCollectionIdChange = useCallback(
    (_event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
      setCollectionId(data.value)
      setHasCollectionIdBeenTyped(!!data.value)
    },
    [setCollectionId, setHasCollectionIdBeenTyped]
  )

  const handleSubmit = useCallback(() => {
    if (
      collectionName &&
      ownerAddress &&
      ((selectedThirdPartyVersion === ThirdPartyVersion.V2 && linkedContract) ||
        (selectedThirdPartyVersion === ThirdPartyVersion.V1 && collectionId))
    ) {
      const now = Date.now()
      const decodedURN = decodeURN(selectedThirdParty.id)
      const urn =
        selectedThirdPartyVersion === ThirdPartyVersion.V1
          ? buildThirdPartyURN(decodedURN.suffix, collectionId)
          : buildThirdPartyV2URN(decodedURN.suffix, linkedContract!.network, linkedContract!.address)
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
        version: selectedThirdPartyVersion,
        thirdPartyId: selectedThirdParty.id,
        linkedContract: linkedContract?.address,
        linkedContractNetwork: linkedContract?.network,
        collectionName
      })
    }
  }, [onSubmit, collectionId, collectionName, selectedThirdPartyVersion, selectedThirdParty, linkedContract, ownerAddress, analytics])

  const isSubmittable =
    collectionName &&
    ownerAddress &&
    ((selectedThirdPartyVersion === ThirdPartyVersion.V2 && linkedContract) ||
      (selectedThirdPartyVersion === ThirdPartyVersion.V1 && collectionId)) &&
    !isCreatingCollection
  const isLoading = isCreatingCollection

  return (
    <Modal name={name} onClose={onClose} size="small">
      <ModalNavigation
        title={t('create_linked_wearable_collection_modal.title')}
        subtitle={t('create_linked_wearable_collection_modal.subtitle')}
        onClose={onClose}
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
          {selectedThirdPartyVersion === ThirdPartyVersion.V2 && (
            <SelectField
              label={t('create_linked_wearable_collection_modal.linked_contract_field.label')}
              className={styles.linkedContractSelect}
              disabled={linkedContractsOptions.length === 0}
              value={linkedContract ? selectedThirdParty.contracts.indexOf(linkedContract) : undefined}
              options={linkedContractsOptions}
              search={false}
              onChange={handleLinkedContractChange}
              message={
                linkedContractsOptions.length === 0 ? t('create_linked_wearable_collection_modal.linked_contract_field.message') : ''
              }
            />
          )}
          <Field
            label={t('create_linked_wearable_collection_modal.name_field.label')}
            placeholder="aName"
            value={collectionName}
            maxLength={TP_COLLECTION_NAME_MAX_LENGTH}
            onChange={handleNameChange}
            disabled={isLoading}
          />
          {selectedThirdPartyVersion === ThirdPartyVersion.V1 && (
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
