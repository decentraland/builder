import { ChainId, Network } from '@dcl/schemas'
import { call } from 'redux-saga/effects'
import { utils } from 'ethers'
import { getChainIdByNetwork, getConnectedProvider } from 'decentraland-dapps/dist/lib/eth'
import { Provider } from 'decentraland-dapps/dist/modules/wallet/types'
import { ContractData, ContractName, getContract } from 'decentraland-transactions'
import { extractThirdPartyId } from 'lib/urn'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'
import { ThirdParty } from './types'

export function isUserManagerOfThirdParty(address: string, thirdParty: ThirdParty): boolean {
  return thirdParty.managers.map(manager => manager.toLowerCase()).includes(address.toLowerCase())
}

export const getThirdPartyForCollection = (thirdParties: Record<string, ThirdParty>, collection: Collection): ThirdParty | undefined =>
  thirdParties[extractThirdPartyId(collection.urn)]

export const getThirdPartyForItem = (thirdParties: Record<string, ThirdParty>, item: Item): ThirdParty | undefined =>
  item.urn ? thirdParties[extractThirdPartyId(item.urn)] : undefined

export function* getPublishItemsSignature(thirdPartyId: string, qty: number) {
  const maticChainId: ChainId = yield call(getChainIdByNetwork, Network.MATIC)
  const provider: Provider | null = yield call(getConnectedProvider)
  if (!provider) {
    throw new Error('Could not get a valid connected Wallet')
  }
  const thirdPartyContract: ContractData = yield call(getContract, ContractName.ThirdPartyRegistry, maticChainId)
  const salt = utils.hexlify(utils.randomBytes(32))
  const domain = {
    name: thirdPartyContract.name,
    verifyingContract: thirdPartyContract.address,
    version: thirdPartyContract.version,
    salt: utils.hexZeroPad(utils.hexlify(maticChainId), 32)
  }
  const dataToSign = {
    thirdPartyId,
    qty,
    salt
  }
  const domainTypes = {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'verifyingContract', type: 'address' },
      { name: 'salt', type: 'bytes32' }
    ],
    ConsumeSlots: [
      { name: 'thirdPartyId', type: 'string' },
      { name: 'qty', type: 'uint256' },
      { name: 'salt', type: 'bytes32' }
    ]
  }

  // TODO: expose this as a function in decentraland-transactions
  const msgString = JSON.stringify({ domain, message: dataToSign, types: domainTypes, primaryType: 'ConsumeSlots' })

  const accounts: string[] = yield call([provider, 'request'], { method: 'eth_requestAccounts', params: [], jsonrpc: '2.0' })
  const from = accounts[0]

  const signature: string = yield call([provider, 'request'], {
    method: 'eth_signTypedData_v4',
    params: [from, msgString],
    jsonrpc: '2.0'
  })

  return { signature, salt }
}
