import { Address } from 'web3x-es/address'
import { toBN } from 'web3x-es/utils'
import { env, utils } from 'decentraland-commons'
import { ContractName, getContract } from 'decentraland-transactions'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { Item } from 'modules/item/types'
import { getMetadata } from 'modules/item/utils'
import { isEqual } from 'lib/address'
import { InitializeItem, Collection, Access } from './types'

export function setOnSale(collection: Collection, wallet: Wallet, isOnSale: boolean): Access[] {
  const { address } = getContract(ContractName.CollectionStore, wallet.networks.MATIC.chainId)
  return [{ address, hasAccess: isOnSale, collection }]
}

export function isOnSale(collection: Collection, wallet: Wallet) {
  const { address } = getContract(ContractName.CollectionStore, wallet.networks.MATIC.chainId)
  return collection.minters.includes(address)
}

export function getCollectionBaseURI() {
  return `${env.get('REACT_APP_PEER_URL', '')}/lambdas/collections/standard/erc721/`
}

export function getCollectionSymbol(collection: Collection) {
  const vowelLessName = collection.name.replace(/a|e|i|o|u|\s/g, '')
  return 'DCL-' + vowelLessName.toUpperCase()
}

export function toInitializeItem(item: Item): InitializeItem {
  return {
    metadata: getMetadata(item),
    rarity: item.rarity!.toLowerCase(),
    price: toBN(item.price || 0),
    beneficiary: item.beneficiary ? Address.fromString(item.beneficiary) : Address.ZERO
  }
}

export function toCollectionObject(collections: Collection[]) {
  return collections.reduce((obj, collection) => {
    obj[collection.id] = utils.omit<Collection>(collection, ['items'])
    return obj
  }, {} as Record<string, Collection>)
}

export function canSeeCollection(collection: Collection, address: string) {
  return collection && [collection.owner, ...collection.managers, ...collection.minters].some(addr => isEqual(addr, address))
}

export function isOwner(collection: Collection, address?: string) {
  return address && isEqual(collection.owner, address)
}

export function isMinter(collection: Collection, address?: string) {
  return address && collection.minters.some(minter => isEqual(minter, address))
}

export function isManager(collection: Collection, address?: string) {
  return address && collection.managers.some(manager => isEqual(manager, address))
}

export function canMintCollectionItems(collection: Collection, address?: string) {
  return collection.isApproved && (isOwner(collection, address) || isMinter(collection, address))
}

export function canManageCollectionItems(collection: Collection, address?: string) {
  return isOwner(collection, address) || isManager(collection, address)
}

export function hasReviews(collection: Collection) {
  return collection.reviewedAt !== collection.createdAt
}
