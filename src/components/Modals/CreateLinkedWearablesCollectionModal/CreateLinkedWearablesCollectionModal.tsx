import { useState, useMemo, useCallback, FC, SyntheticEvent } from 'react'
import { Collection, TP_COLLECTION_NAME_MAX_LENGTH } from 'modules/collection/types'
import { debounce } from 'lib/debounce'
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
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { Props } from './CreateLinkedWearablesCollectionModal.types'
import { providers } from 'ethers'
import { buildThirdPartyURN, decodeURN } from 'lib/urn'
import uuid from 'uuid'
import { ERC165__factory } from 'contracts/factories'
import { isValid } from 'lib/address'
import { Network } from '@dcl/schemas'

export const CreateLinkedWearablesCollectionModal: FC<Props> = (props: Props) => {
  const { name, thirdParties, onClose, isCreatingCollection, error, ownerAddress, onSubmit } = props
  const [collectionName, setCollectionName] = useState('')
  const [contractAddress, setContractAddress] = useState<string>()
  const [contractNetwork, setContractNetwork] = useState<Network>(Network.ETHEREUM)
  const [contractValidationError, setContractValidationError] = useState<string>()
  const [isCheckingContract, setIsCheckingContract] = useState(false)
  const [thirdPartyId, setThirdPartyId] = useState('')

  const selectedThirdParty = useMemo(() => {
    return thirdParties.find(thirdParty => thirdParty.id === thirdPartyId) || thirdParties[0]
  }, [thirdParties, thirdPartyId])

  const handleNameChange = useCallback(
    (_: SyntheticEvent, data: InputOnChangeData) => {
      setCollectionName(data.value)
    },
    [setCollectionName]
  )

  const handleThirdPartyChange = useCallback(
    (_: React.SyntheticEvent, data: DropdownProps) => {
      if (data.value) {
        setThirdPartyId(data.value.toString())
      }
    },
    [setThirdPartyId]
  )

  const validateContractAddress = useCallback(
    debounce(async (contractAddress: string, network: Network) => {
      if (!isValid(contractAddress)) {
        setContractValidationError('Invalid contract address')
        return
      }
      setIsCheckingContract(true)
      setContractValidationError(undefined)
      console.log('Launching debounced function', contractAddress, network)
      const rpcProviderUrl = network === Network.MATIC ? 'https://rpc.decentraland.org/polygon' : 'https://rpc.decentraland.org/mainnet'
      console.log('RPC provider URL', rpcProviderUrl)
      const jsonRpcProvider = new providers.JsonRpcProvider(rpcProviderUrl)
      const erc165Contract = ERC165__factory.connect(contractAddress, jsonRpcProvider)

      const Erc721InterfaceId = '0x01ffc9a7'
      const Erc1155InterfaceId = '0xd9b67a26'
      try {
        const supportsInterfaces = await Promise.all([
          erc165Contract.supportsInterface(Erc721InterfaceId),
          erc165Contract.supportsInterface(Erc1155InterfaceId)
        ])
        console.log('Supports interface', supportsInterfaces)
        if (!supportsInterfaces.some(supportsInterface => supportsInterface)) {
          setContractValidationError(
            'The contract is not based on the ERC721 or the ERC1155 standard. Please, check if the network or the contract address is correct.'
          )
        }
      } catch (error) {
        setContractValidationError('There was an error checking the contract. Please try again later.')
        console.error(error)
      } finally {
        setIsCheckingContract(false)
      }
    }, 400),
    []
  )

  const handleContractAddressChange = useCallback(
    (_: SyntheticEvent, data: InputOnChangeData) => {
      console.log('Handling contract address change')
      setContractAddress(data.value)
      return validateContractAddress(data.value, contractNetwork)
    },
    [validateContractAddress, setContractAddress, contractNetwork]
  )

  const handleNetworkChange = useCallback(
    (_: SyntheticEvent, data: DropdownProps) => {
      setContractNetwork(data.value as Network)
    },
    [setContractNetwork]
  )

  const handleSubmit = useCallback(() => {
    // const { address, onSubmit } = this.props
    // const { collectionName, urnSuffix } = this.state

    if (collectionName && contractAddress && ownerAddress) {
      const now = Date.now()
      const decodedURN = decodeURN(selectedThirdParty.id)

      const collection: Collection = {
        id: uuid.v4(),
        name: collectionName,
        owner: ownerAddress,
        urn: buildThirdPartyURN(decodedURN.suffix, contractAddress),
        isPublished: false,
        isApproved: false,
        minters: [],
        managers: [],
        createdAt: now,
        updatedAt: now
      }
      onSubmit(collection)
    }
    // this.analytics.track('Create TP Collection', { collectionId: collection.id })
  }, [onSubmit, collectionName, contractAddress, selectedThirdParty.id, ownerAddress])

  const isNotSubmittable = Boolean(!collectionName || isCreatingCollection || isCheckingContract || contractValidationError)
  const isLoading = isCreatingCollection || isCheckingContract
  const networkOptions = useMemo(
    () => [
      { value: Network.ETHEREUM, text: 'Ethereum' },
      { value: Network.MATIC, text: 'Polygon' }
    ],
    []
  )

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
          <SelectField
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
          />
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
