import { env, utils } from 'decentraland-commons'
import { Address } from 'web3x-es/address'
import { toBN } from 'web3x-es/utils'
import { Item } from 'modules/item/types'
import { COLLECTION_STORE_ADDRESS } from 'modules/common/contracts'
import { getMetadata } from 'modules/item/utils'
import { isEqual } from 'lib/address'
import { InitializeItem, Collection, Access } from './types'

export function setOnSale(collection: Collection, isOnSale: boolean): Access[] {
  return [{ address: COLLECTION_STORE_ADDRESS, hasAccess: isOnSale, collection }]
}

export function isOnSale(collection: Collection) {
  return collection.minters.includes(COLLECTION_STORE_ADDRESS)
}

export function getCollectionBaseURI() {
  return env.get('REACT_APP_ERC721_COLLECTION_BASE_URI', '')
}

export function getCollectionSymbol(collection: Collection) {
  const vowelLessName = collection.name.replace(/a|e|i|o|u|\s/g, '')
  return 'DCL-' + vowelLessName.toUpperCase()
}

// TODO: check getRarityIndex
export function toInitializeItem(item: Item): InitializeItem {
  return {
    rarity: item.rarity!.toLowerCase(),
    price: toBN(item.price!),
    beneficiary: Address.fromString(item.beneficiary!),
    metadata: getMetadata(item)
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
