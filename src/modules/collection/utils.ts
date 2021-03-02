import { utils } from 'decentraland-commons'
import { Address } from 'web3x-es/address'
import { toBN } from 'web3x-es/utils'
import { env } from 'decentraland-commons'
import { ERC721CollectionV2 } from 'contracts/ERC721CollectionV2'
import { Item } from 'modules/item/types'
import { COLLECTION_STORE_ADDRESS } from 'modules/common/contracts'
import { getRarityIndex, getMetadata } from 'modules/item/utils'
import { isEqual } from 'lib/address'
import { InitializeItem, Collection, Access } from './types'

const EMPTY_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000'
const BASE_URI = env.get('REACT_APP_ERC721_COLLECTION_BASE_URI', '')

export function setOnSale(collection: Collection, isOnSale: boolean): Access[] {
  return [{ address: COLLECTION_STORE_ADDRESS, hasAccess: isOnSale, collection }]
}

export function isOnSale(collection: Collection) {
  return collection.minters.includes(COLLECTION_STORE_ADDRESS)
}

export function getCollectionSymbol(collection: Collection) {
  const vowelLessName = collection.name.replace(/a|e|i|o|u|\s/g, '')
  return 'DCL-' + vowelLessName.toUpperCase()
}

export function initializeCollection(implementation: ERC721CollectionV2, collection: Collection, items: Item[], address: Address) {
  const shouldComplete = true // false only for multiple tx creates
  const buffer = implementation.methods
    .initialize(collection.name, getCollectionSymbol(collection), address, shouldComplete, BASE_URI, items.map(toInitializeItem))
    .encodeABI()
  return '0x' + buffer.toString('hex')
}

function toInitializeItem(item: Item): InitializeItem {
  return {
    rarity: getRarityIndex(item.rarity!),
    totalSupply: 0,
    price: toBN(item.price!),
    beneficiary: Address.fromString(item.beneficiary!),
    metadata: getMetadata(item),
    contentHash: EMPTY_HASH
  }
}

export function toCollectionObject(collections: Collection[]) {
  return collections.reduce((obj, collection) => {
    obj[collection.id] = utils.omit<Collection>(collection, ['items'])
    return obj
  }, {} as Record<string, Collection>)
}

export function canSeeCollection(collection: Collection, address: string) {
  return [collection.owner, ...collection.managers, ...collection.minters].some(addr => isEqual(addr, address))
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
