import { env, utils } from 'decentraland-commons'
import { ChainId } from '@dcl/schemas'
import { ContractName, getContract } from 'decentraland-transactions'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { locations } from 'routing/locations'
import { isEqual, includes } from 'lib/address'
import { decodeURN, URNType } from 'lib/urn'
import { Item, SyncStatus } from 'modules/item/types'
import { Collection, Access, Mint, CollectionType } from './types'

export function setOnSale(collection: Collection, wallet: Wallet, isOnSale: boolean): Access[] {
  const address = getSaleAddress(wallet.networks.MATIC.chainId)
  return [{ address, hasAccess: isOnSale, collection }]
}

export function isOnSale(collection: Collection, wallet: Wallet) {
  const address = getSaleAddress(wallet.networks.MATIC.chainId)
  return includes(collection.minters, address)
}

export function isLocked(collection: Collection) {
  if (!collection.lock || collection.isPublished) {
    return false
  }
  const deadline = new Date(collection.lock)
  deadline.setDate(deadline.getDate() + 1)

  return deadline.getTime() > Date.now()
}

export function getSaleAddress(chainId: ChainId) {
  return getContract(ContractName.CollectionStore, chainId).address.toLowerCase()
}

export function getCollectionEditorURL(collection: Collection, items: Item[]): string {
  return locations.itemEditor({ collectionId: collection.id, itemId: items.length > 0 ? items[0].id : undefined })
}

export function getExplorerURL(collection: Collection) {
  const EXPLORER_URL = env.get('REACT_APP_EXPLORER_URL', '')
  const BUILDER_SERVER_URL = env.get('REACT_APP_BUILDER_SERVER_URL', '')
  return `${EXPLORER_URL}?WITH_COLLECTIONS=${collection.id}&BUILDER_SERVER_URL=${BUILDER_SERVER_URL}&NETWORK=ropsten&DEBUG_MODE=true`
}

export function getCollectionBaseURI() {
  return env.get('REACT_APP_ERC721_COLLECTION_BASE_URI', '')
}

export function getCollectionType(collection: Collection): CollectionType {
  const { type } = decodeURN(collection.urn)

  switch (type) {
    case URNType.COLLECTIONS_THIRDPARTY:
      return CollectionType.THIRD_PARTY
    case URNType.COLLECTIONS_V2:
    case URNType.BASE_AVATARS:
      return CollectionType.DECENTRALAND
    default:
      throw new Error(`Tried to get a collection type from an invalid URN: ${collection.urn}`)
  }
}

export function getCollectionSymbol(collection: Collection) {
  const vowelLessName = collection.name.replace(/a|e|i|o|u|\s/g, '')
  return 'DCL-' + vowelLessName.toUpperCase()
}

export function toCollectionObject(collections: Collection[]) {
  return collections.reduce((obj, collection) => {
    obj[collection.id] = utils.omit<Collection>(collection, ['items'])
    return obj
  }, {} as Record<string, Collection>)
}

export function canSeeCollection(collection: Collection, address: string) {
  return !!collection && [collection.owner, ...collection.managers, ...collection.minters].some(addr => isEqual(addr, address))
}

export function sortCollectionByCreatedAt(collectionA: Collection, collectionB: Collection) {
  return collectionB.createdAt - collectionA.createdAt
}

export function isOwner(collection: Collection, address?: string) {
  return !!address && isEqual(collection.owner, address)
}

export function isMinter(collection: Collection, address?: string) {
  return !!address && collection.minters.some(minter => isEqual(minter, address))
}

export function isManager(collection: Collection, address?: string) {
  return !!address && collection.managers.some(manager => isEqual(manager, address))
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

export function getTotalAmountOfMintedItems(mints: Mint[]) {
  return mints.reduce((total, mint) => total + mint.amount, 0)
}

export function getMostRelevantStatus(statusA: SyncStatus, statusB: SyncStatus) {
  const sorted = Object.values(SyncStatus)
  const indexA = sorted.indexOf(statusA)
  const indexB = sorted.indexOf(statusB)
  return indexA < indexB ? statusA : statusB
}
