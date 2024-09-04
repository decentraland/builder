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
  DropdownProps,
  Message
} from 'decentraland-ui'
import uuid from 'uuid'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics'
import { buildThirdPartyURN, decodeURN, getDefaultThirdPartyUrnSuffix } from 'lib/urn'
import { shorten } from 'lib/address'
import ethereumSvg from '../../../icons/ethereum.svg'
import polygonSvg from '../../../icons/polygon.svg'
import { Props } from './CreateThirdPartyCollectionModal.types'
import styles from './CreateThirdPartyCollectionModal.module.css'
import { ContractNetwork } from '@dcl/schemas'

const imgSrcByNetwork = {
  [ContractNetwork.MAINNET]: ethereumSvg,
  [ContractNetwork.MATIC]: polygonSvg,
  [ContractNetwork.SEPOLIA]: ethereumSvg,
  [ContractNetwork.AMOY]: polygonSvg
}

export const CreateThirdPartyCollectionModal: FC<Props> = (props: Props) => {
  const {
    name,
    thirdParties,
    onClose,
    isCreatingCollection,
    isLinkedWearablesV2Enabled,
    isLinkedWearablesPaymentsEnabled,
    error,
    ownerAddress,
    onSubmit,
    onBack
  } = props
  const [collectionName, setCollectionName] = useState('')
  const [hasCollectionIdBeenTyped, setHasCollectionIdBeenTyped] = useState(false)
  const [collectionId, setCollectionId] = useState('')
  const [thirdPartyId, setThirdPartyId] = useState(thirdParties[0].id)
  const [selectedNetwork, setSelectedNetwork] = useState<string | undefined>()
  const [selectedContract, setSelectedContract] = useState<string | undefined>()
  const analytics = getAnalytics()

  const selectedThirdParty = useMemo(() => {
    return thirdParties.find(thirdParty => thirdParty.id === thirdPartyId) || thirdParties[0]
  }, [thirdParties, thirdPartyId])
  const thirdPartyOptions = useMemo(() => thirdParties.map(thirdParty => ({ value: thirdParty.id, text: thirdParty.name })), [thirdParties])
  const isCollectionNameInvalid = useMemo(() => collectionName.includes(':'), [collectionName])

  const thirdPartyContractNetworkOptions = useMemo(
    () =>
      Array.from(new Set(selectedThirdParty.contracts.map(contract => contract.network))).map(network => ({
        text: t(`global.networks.${network}`),
        value: network,
        image: imgSrcByNetwork[network]
      })),
    [selectedThirdParty]
  )
  const thirdPartyContractAddressesOptions = useMemo(
    () =>
      selectedThirdParty.contracts
        .filter(contract => contract.network === selectedNetwork)
        .map(contract => ({ value: contract.address, text: shorten(contract.address) })),
    [selectedThirdParty, selectedNetwork]
  )

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
        const thirdParty = thirdParties.find(thirdParty => thirdParty.id === data.value?.toString())
        if (thirdParty?.contracts.length) {
          setSelectedNetwork(thirdParty?.contracts[0].network)
          setSelectedContract(thirdParty?.contracts[0].address)
        }
      }
    },
    [setThirdPartyId, thirdParties]
  )
  const handleCollectionIdChange = useCallback(
    (_event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
      setCollectionId(data.value)
      setHasCollectionIdBeenTyped(!!data.value)
    },
    [setCollectionId, setHasCollectionIdBeenTyped]
  )
  const handleNetworkChange = useCallback(
    (_: React.SyntheticEvent, data: DropdownProps) => {
      if (data.value) {
        setSelectedNetwork(data.value.toString())
        setSelectedContract(selectedThirdParty.contracts.find(contract => contract.network === data.value)?.address)
      }
    },
    [setSelectedNetwork, setSelectedContract, selectedThirdParty]
  )
  const handleContractChange = useCallback(
    (_: React.SyntheticEvent, data: DropdownProps) => {
      setSelectedContract(data.value?.toString())
    },
    [setSelectedContract]
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
        updatedAt: now,
        linkedContractAddress: selectedContract,
        linkedContractNetwork: selectedNetwork as ContractNetwork
      }
      onSubmit(collection)
      analytics.track('Create TP Collection', {
        collectionId: collection.id,
        thirdPartyId: selectedThirdParty.id,
        linkedContractAddress: selectedContract,
        linkedContractNetwork: selectedNetwork,
        collectionName
      })
    }
  }, [onSubmit, collectionId, collectionName, selectedThirdParty, ownerAddress, analytics])

  const isSubmittable = collectionName && ownerAddress && !isCollectionNameInvalid && collectionId
  !isCreatingCollection && (isLinkedWearablesV2Enabled ? selectedContract && selectedNetwork : true)
  const isLoading = isCreatingCollection
  const errorMessage = useMemo(() => {
    if (error?.includes('linkedContract_linkedNetwork_thirdPartyId_unique')) {
      return t('create_third_party_collection_modal.errors.linked_contract_already_in_use')
    }
    return error
  }, [error, t])

  return (
    <Modal name={name} onClose={isLoading ? undefined : onClose} size="small">
      <ModalNavigation
        title={t('create_third_party_collection_modal.title')}
        subtitle={t('create_third_party_collection_modal.subtitle')}
        onClose={isLoading ? undefined : onClose}
        onBack={isLoading || !isLinkedWearablesPaymentsEnabled ? undefined : onBack}
      />
      <Form onSubmit={handleSubmit} disabled={!isSubmittable}>
        <ModalContent>
          <SelectField
            label={t('create_third_party_collection_modal.third_party_field.label')}
            options={thirdPartyOptions}
            onChange={handleThirdPartyChange}
            disabled={isLoading}
            value={selectedThirdParty.id}
          />
          {isLinkedWearablesV2Enabled && thirdPartyContractNetworkOptions.length > 0 && (
            <div className={styles.contract}>
              <SelectField
                label={t('global.network')}
                options={thirdPartyContractNetworkOptions}
                onChange={handleNetworkChange}
                disabled={isLoading}
                value={selectedNetwork}
              />
              <SelectField
                label={t('create_third_party_collection_modal.linked_contract_field.label')}
                options={thirdPartyContractAddressesOptions}
                onChange={handleContractChange}
                disabled={isLoading}
                value={selectedContract}
              />
            </div>
          )}
          <Field
            label={t('create_third_party_collection_modal.name_field.label')}
            placeholder={t('create_third_party_collection_modal.name_field.placeholder')}
            value={collectionName}
            maxLength={TP_COLLECTION_NAME_MAX_LENGTH}
            onChange={handleNameChange}
            error={isCollectionNameInvalid}
            message={isCollectionNameInvalid ? t('create_third_party_collection_modal.name_field.message') : ''}
            disabled={isLoading}
          />
          {!isLinkedWearablesV2Enabled && (
            <Field
              label={t('create_third_party_collection_modal.collection_id_field.label')}
              placeholder="0x..."
              message={t('create_third_party_collection_modal.collection_id_field.message')}
              value={collectionId}
              onChange={handleCollectionIdChange}
            />
          )}
          {errorMessage ? <Message error tiny visible content={errorMessage} header={t('global.error_ocurred')} /> : null}
        </ModalContent>
        <ModalActions>
          <Button primary disabled={!isSubmittable || isLoading} loading={isLoading}>
            {t('global.create')}
          </Button>
        </ModalActions>
      </Form>
    </Modal>
  )
}
