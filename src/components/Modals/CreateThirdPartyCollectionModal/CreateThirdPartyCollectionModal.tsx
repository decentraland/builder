import { useState, useMemo, useCallback, FC, SyntheticEvent } from 'react'
import { ContractNetwork, ProviderType } from '@dcl/schemas'
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
import { getRpcUrls } from 'decentraland-connect'
import { Contract, providers } from 'ethers'
import { isAddress } from 'ethers/lib/utils'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics'
import { Collection, TP_COLLECTION_NAME_MAX_LENGTH } from 'modules/collection/types'
import { buildThirdPartyId, buildThirdPartyURN, decodeURN, getDefaultThirdPartyUrnSuffix } from 'lib/urn'
import { shorten, isAddressBeingWritten } from 'lib/address'
import { imgSrcByNetwork } from 'components/NetworkIcon'
import { isDevelopment } from 'lib/environment'
import { debounce } from 'lib/debounce'
import { Props } from './CreateThirdPartyCollectionModal.types'
import styles from './CreateThirdPartyCollectionModal.module.css'
import { fromContractNetworkToChainId, isTestNetwork } from './utils'

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
  const [thirdPartyId, setThirdPartyId] = useState<string | undefined>()
  const [selectedNetwork, setSelectedNetwork] = useState<string | undefined>()
  const [selectedContract, setSelectedContract] = useState<string | undefined>()
  const [contractError, setContractError] = useState<string>()
  const [isContractValid, setIsContractValid] = useState(false)
  const [isCheckingContract, setIsCheckingContract] = useState(false)
  const analytics = getAnalytics()

  const selectedThirdParty = useMemo(
    () => thirdParties.find(thirdParty => thirdParty.id === thirdPartyId),
    [thirdParties, thirdPartyId, isLinkedWearablesPaymentsEnabled]
  )
  const thirdPartyOptions = useMemo(() => thirdParties.map(thirdParty => ({ value: thirdParty.id, text: thirdParty.name })), [thirdParties])
  const isCollectionNameInvalid = useMemo(() => collectionName.includes(':'), [collectionName])

  // Auto-fill contract options if the user selected a third party
  const thirdPartyContractNetworkOptions = useMemo(
    () =>
      (selectedThirdParty ? Array.from(new Set(selectedThirdParty.contracts.map(contract => contract.network))) : []).map(network => ({
        text: t(`global.networks.${network}`),
        value: network,
        image: imgSrcByNetwork[network]
      })),
    [selectedThirdParty]
  )
  const thirdPartyContractAddressesOptions = useMemo(
    () =>
      (selectedThirdParty ? selectedThirdParty.contracts : [])
        .filter(contract => contract.network === selectedNetwork)
        .map(contract => ({ value: contract.address, text: shorten(contract.address) })),
    [selectedThirdParty, selectedNetwork]
  )

  // If the user did not select a third party, show all the contract network options
  const contractNetworkOptions = useMemo(
    () =>
      Object.values(ContractNetwork)
        .filter(network => isDevelopment || !isTestNetwork(network))
        .map(network => ({
          text: t(`global.networks.${network}`),
          value: network,
          image: imgSrcByNetwork[network]
        })),
    [isDevelopment]
  )

  const validateContract = useCallback(
    debounce(async (contractAddress: string, network: ContractNetwork) => {
      setIsCheckingContract(true)
      setContractError(undefined)
      const jsonRpcProvider = new providers.JsonRpcProvider(getRpcUrls(ProviderType.NETWORK)[fromContractNetworkToChainId(network)])
      const erc165Contract = new Contract(
        contractAddress,
        ['function supportsInterface(bytes4) external view returns (bool)'],
        jsonRpcProvider
      )
      const Erc721InterfaceId = '0x01ffc9a7'
      const Erc1155InterfaceId = '0xd9b67a26'
      try {
        const supportsInterfaces = await Promise.all([
          erc165Contract.supportsInterface(Erc721InterfaceId),
          erc165Contract.supportsInterface(Erc1155InterfaceId)
        ])
        if (!supportsInterfaces.some(supportsInterface => supportsInterface)) {
          setContractError(
            'The contract is not based on the ERC721 or the ERC1155 standard. Please, check if the network or the contract address is correct.'
          )
        }
        setIsContractValid(true)
      } catch (error) {
        setContractError('There was an error checking the contract. Please, check if the network or the contract address is correct')
        console.error(error)
      } finally {
        setIsCheckingContract(false)
      }
    }, 1000),
    [setIsCheckingContract, setContractError]
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
      setIsContractValid(false)
      if (data.value) {
        setSelectedNetwork(data.value.toString())
        if (!selectedThirdParty && selectedContract && isAddress(selectedContract)) {
          validateContract(selectedContract, data.value)
        } else if (selectedThirdParty) {
          setSelectedContract(selectedThirdParty.contracts.find(contract => contract.network === data.value)?.address)
        }
      }
    },
    [setSelectedNetwork, setSelectedContract, selectedThirdParty, selectedContract, isLinkedWearablesPaymentsEnabled]
  )
  const handleContractSelectorChange = useCallback(
    (_: React.SyntheticEvent, data: DropdownProps) => {
      setSelectedContract(data.value?.toString())
    },
    [setSelectedContract]
  )

  const handleContractChange = useCallback(
    (_: React.SyntheticEvent, data: InputOnChangeData) => {
      if (isAddressBeingWritten(data.value)) {
        setSelectedContract(data.value)
      } else {
        return
      }

      setIsContractValid(false)
      if (isAddress(data.value)) {
        validateContract(data.value, selectedNetwork as ContractNetwork)
      }
    },
    [setSelectedContract, selectedNetwork, validateContract]
  )

  const handleSubmit = useCallback(() => {
    const thirdPartyId = selectedThirdParty?.id ?? buildThirdPartyId(getDefaultThirdPartyUrnSuffix(collectionName))
    if (collectionName && ownerAddress && collectionId) {
      const now = Date.now()
      const decodedURN = decodeURN(thirdPartyId)
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
        thirdPartyId: thirdPartyId,
        linkedContractAddress: selectedContract,
        linkedContractNetwork: selectedNetwork,
        collectionName
      })
    }
  }, [onSubmit, collectionId, selectedContract, selectedNetwork, collectionName, selectedThirdParty, ownerAddress, analytics])

  const isSubmittable =
    collectionName &&
    ownerAddress &&
    !isCollectionNameInvalid &&
    collectionId &&
    !contractError &&
    !isCreatingCollection &&
    (isLinkedWearablesV2Enabled
      ? selectedContract && isAddress(selectedContract) && (isLinkedWearablesPaymentsEnabled ? isContractValid : true) && selectedNetwork
      : true)
  const isLoading = isCreatingCollection || isCheckingContract
  const errorMessage = useMemo(() => {
    if (error?.includes('linkedContract_linkedNetwork_thirdPartyId_unique')) {
      return t('create_third_party_collection_modal.errors.linked_contract_already_in_use')
    }
    return error
  }, [error, t])

  const collectionNameField = useMemo(
    () => (
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
    ),
    [t, collectionName, handleNameChange, isCollectionNameInvalid, isLoading]
  )

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
          {thirdParties.length && !isLinkedWearablesPaymentsEnabled && (
            <SelectField
              label={t('create_third_party_collection_modal.third_party_field.label')}
              options={thirdPartyOptions}
              onChange={handleThirdPartyChange}
              disabled={isLoading}
              value={selectedThirdParty?.id}
            />
          )}
          {isLinkedWearablesPaymentsEnabled && collectionNameField}
          {isLinkedWearablesV2Enabled && (
            <div className={styles.contract}>
              {thirdPartyContractNetworkOptions.length > 0 && !isLinkedWearablesPaymentsEnabled ? (
                <>
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
                    onChange={handleContractSelectorChange}
                    disabled={isLoading}
                    value={selectedContract}
                  />
                </>
              ) : (
                <>
                  <SelectField
                    label={t('global.network')}
                    options={contractNetworkOptions}
                    onChange={handleNetworkChange}
                    disabled={isLoading}
                    value={selectedNetwork}
                  />
                  <Field
                    label={t('create_third_party_collection_modal.linked_contract_field.label')}
                    onChange={handleContractChange}
                    maxLength={42}
                    className={styles.contractInput}
                    disabled={isLoading}
                    error={!!contractError}
                    message={contractError}
                    value={selectedContract}
                  />
                </>
              )}
            </div>
          )}
          {!isLinkedWearablesPaymentsEnabled && collectionNameField}
          {!isLinkedWearablesV2Enabled && (
            <Field
              label={t('create_third_party_collection_modal.collection_id_field.label')}
              placeholder="0x..."
              message={t('create_third_party_collection_modal.collection_id_field.message')}
              value={collectionId}
              onChange={handleCollectionIdChange}
            />
          )}
          {errorMessage ? <Message error visible content={errorMessage} header={t('global.error_ocurred')} /> : null}
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
