import { useState, useMemo, useCallback, FC, SyntheticEvent } from 'react'
// import slug from 'slug'
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
  DropdownProps,
  Dropdown
} from 'decentraland-ui'
import uuid from 'uuid'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
// import { LinkedContract, ThirdPartyVersion } from 'modules/thirdParty/types'
import { ThirdPartyVersion } from 'modules/thirdParty/types'
import { buildThirdPartyURN, buildThirdPartyV2URN, decodeURN } from 'lib/urn'
import { Props } from './CreateLinkedWearablesCollectionModal.types'
import ethereumSvg from '../../../icons/ethereum.svg'
import { getThirdPartyVersion } from 'modules/thirdParty/utils'

// const noLinkedContractsOptions = [{ text: 'No linked contracts', value: undefined }]

export const CreateLinkedWearablesCollectionModal: FC<Props> = (props: Props) => {
  const { name, thirdParties, onClose, isCreatingCollection, error, ownerAddress, onSubmit } = props
  const [collectionName, setCollectionName] = useState('')
  const [linkedContractIndex, setLinkedContractIndex] = useState<number>()
  // const [urnSuffix, setUrnSuffix] = useState('')
  // const [contractAddress, setContractAddress] = useState<string>()
  // const [contractNetwork, setContractNetwork] = useState<Network>(Network.ETHEREUM)
  // const [contractValidationError, setContractValidationError] = useState<string>()
  // const [isCheckingContract, setIsCheckingContract] = useState(false)
  const [thirdPartyId, setThirdPartyId] = useState(thirdParties[0].id)

  const selectedThirdParty = useMemo(() => {
    return thirdParties.find(thirdParty => thirdParty.id === thirdPartyId) || thirdParties[0]
  }, [thirdParties, thirdPartyId])
  const selectedThirdPartyVersion = useMemo(
    () => (selectedThirdParty ? getThirdPartyVersion(selectedThirdParty) : undefined),
    [selectedThirdParty]
  )
  const selectedLinkedContract = useMemo(
    () => (linkedContractIndex && selectedThirdParty ? selectedThirdParty.contracts[linkedContractIndex] : undefined),
    [selectedThirdParty]
  )
  const linkedCollectionOptions = useMemo(
    () =>
      selectedThirdParty?.contracts.map((contract, index) => ({
        text: contract.address,
        value: index,
        image: { avatar: false, src: ethereumSvg }
      })),
    [selectedThirdParty]
  )

  const handleNameChange = useCallback(
    (_: SyntheticEvent, data: InputOnChangeData) => {
      setCollectionName(data.value)
    },
    [setCollectionName]
  )

  const handleThirdPartyChange = useCallback(
    (_: React.SyntheticEvent, data: DropdownProps) => {
      if (data.value) {
        setLinkedContractIndex(undefined)
        setThirdPartyId(data.value.toString())
      }
    },
    [setThirdPartyId]
  )

  const handleLinkedContractChange = useCallback(
    (_: SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => setLinkedContractIndex(data.value as number),
    [selectedThirdParty]
  )

  // const handleUrnSuffixChange = useCallback((_event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
  //   // this.setState({ urnSuffix: slug(data.value), isTypedUrnSuffix: !!data.value })
  // }, [])

  const handleSubmit = useCallback(() => {
    if (getThirdPartyVersion(selectedThirdParty) === ThirdPartyVersion.V2) {
      if (collectionName && selectedLinkedContract && ownerAddress) {
        const now = Date.now()
        const decodedURN = decodeURN(selectedThirdParty.id)

        const collection: Collection = {
          id: uuid.v4(),
          name: collectionName,
          owner: ownerAddress,
          urn: buildThirdPartyV2URN(decodedURN.suffix, selectedThirdParty.contracts[0].network, selectedThirdParty.contracts[0].address),
          isPublished: false,
          isApproved: false,
          minters: [],
          managers: [],
          createdAt: now,
          updatedAt: now
        }
        onSubmit(collection)
      }
    } else {
      if (collectionName && ownerAddress) {
        const now = Date.now()
        const decodedURN = decodeURN(selectedThirdParty.id)

        const collection: Collection = {
          id: uuid.v4(),
          name: collectionName,
          owner: ownerAddress,
          urn: buildThirdPartyURN(decodedURN.suffix, 'collectionId'),
          isPublished: false,
          isApproved: false,
          minters: [],
          managers: [],
          createdAt: now,
          updatedAt: now
        }
        onSubmit(collection)
      }
    }

    // this.analytics.track('Create TP Collection', { collectionId: collection.id })
  }, [onSubmit, collectionName, selectedThirdPartyVersion, selectedThirdParty, selectedLinkedContract, ownerAddress])

  const isNotSubmittable = Boolean(!collectionName || isCreatingCollection)
  const isLoading = isCreatingCollection

  return (
    <Modal name={name} onClose={onClose} size="tiny">
      <ModalNavigation
        title={t('create_third_party_collection_modal.title')}
        subtitle={t('create_third_party_collection_modal.subtitle')}
        onClose={onClose}
      />
      <Form onSubmit={handleSubmit} disabled={isNotSubmittable}>
        <ModalContent>
          <SelectField
            label={t('create_third_party_collection_modal.third_party.label')}
            options={thirdParties.map(thirdParty => ({ value: thirdParty.id, text: thirdParty.name }))}
            onChange={handleThirdPartyChange}
            disabled={isLoading}
            value={selectedThirdParty.id}
          />
          <Field
            label={t('create_third_party_collection_modal.name_field.label')}
            placeholder="aName"
            message={t('create_third_party_collection_modal.name_field.message', { maxLength: TP_COLLECTION_NAME_MAX_LENGTH })}
            value={collectionName}
            maxLength={TP_COLLECTION_NAME_MAX_LENGTH}
            onChange={handleNameChange}
            disabled={isLoading}
          />
          {selectedThirdPartyVersion === ThirdPartyVersion.V2 ? (
            <>
              <Dropdown
                options={linkedCollectionOptions}
                disabled={linkedCollectionOptions.length === 0}
                value={0}
                onChange={handleLinkedContractChange}
              />
              {/* <SelectField
                label="Linked contract"
                disabled={selectedThirdParty.contracts.length === 0}
                value={linkedContractIndex}
                options={linkedCollectionOptions}
                // value={selectedThirdParty.contracts.length === 0 ? undefined : selectedLinkedContract}
                // options={selectedThirdParty.contracts.length === 0 ? noLinkedContractsOptions : linkedCollectionOptions}
                onChange={handleLinkedContractChange}
              /> */}
              {selectedThirdParty.contracts.length === 0 && <span>There's no collection available :S</span>}
            </>
          ) : (
            <span>Some value here</span>
            // <Field
            //   label={t('create_third_party_collection_modal.urn_suffix_field.label')}
            //   placeholder="0x..."
            //   message={t('create_third_party_collection_modal.urn_suffix_field.message')}
            //   value={urnSuffix}
            //   onChange={handleUrnSuffixChange}
            // />
          )}

          {/* <SelectField
            label={'Network'}
            options={networkOptions}
            onChange={handleNetworkChange}
            disabled={isLoading}
            value={contractNetwork}
          />
          <Field
            label="Linked Contract Address"
            placeholder="0x..."
            message={contractValidationError}
            type="address"
            value={contractAddress}
            maxLength={TP_COLLECTION_NAME_MAX_LENGTH}
            onChange={handleContractAddressChange}
            disabled={isLoading}
            error={!!contractValidationError}
          /> */}
          {error ? <small className="danger-text">{error}</small> : null}
        </ModalContent>
        <ModalActions>
          <Button primary disabled={isNotSubmittable} loading={isLoading}>
            {t('global.create')}
          </Button>
        </ModalActions>
      </Form>
    </Modal>
  )
}
