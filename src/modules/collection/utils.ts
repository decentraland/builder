import { ChainId } from '@dcl/schemas'
import { ContractName, getContract } from 'decentraland-transactions'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { config } from 'config'
import { locations } from 'routing/locations'
import { isEqual, includes } from 'lib/address'
import { decodeURN, isThirdParty, URNType } from 'lib/urn'
import { Item, SyncStatus } from 'modules/item/types'
import { Collection, Access, Mint, CollectionType } from './types'
import { MAX_TP_ITEMS_TO_REVIEW, MIN_TP_ITEMS_TO_REVIEW, TP_TRESHOLD_TO_REVIEW } from './constants'

export const UNSYNCED_COLLECTION_ERROR_PREFIX = 'UnsyncedCollection:'

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

export function getExplorerURL({ collection, item_ids }: { collection?: Collection; item_ids?: string[] }): string {
  if (!collection && !item_ids) {
    throw new Error('Either a collection or item ids must be specified to get the explorer url')
  }
  const EXPLORER_URL = config.get('EXPLORER_URL', '')
  const BUILDER_SERVER_URL = config.get('BUILDER_SERVER_URL', '')
  let URL = `${EXPLORER_URL}?BUILDER_SERVER_URL=${BUILDER_SERVER_URL}&NETWORK=ropsten&DEBUG_MODE=true`

  if (collection) {
    URL += `&WITH_COLLECTIONS=${collection.id}`
  } else if (item_ids) {
    URL += `&WITH_ITEMS=${item_ids.join(',')}`
  }

  return URL
}

export function getCollectionBaseURI() {
  return config.get('ERC721_COLLECTION_BASE_URI', '')
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
    const { items: _, ...rest } = collection as Collection & { items?: any[] }
    obj[collection.id] = rest
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

export function isTPCollection(collection: Collection): boolean {
  return isThirdParty(collection.urn)
}

export function getCollectionFactoryContract(chainId: ChainId) {
  return getContract(ContractName.CollectionFactoryV3, chainId)
}

export const getTPThresholdToReview = (totalItems: number) => {
  // Reference: https://governance.decentraland.org/proposal/?id=f69c4d40-aaaf-11ec-87a7-6d2a41508231
  // Max to review, 300 items, min to review is 50 or 1% of the collection
  if (totalItems < MIN_TP_ITEMS_TO_REVIEW) {
    return totalItems
  } else if (totalItems >= MIN_TP_ITEMS_TO_REVIEW && totalItems * TP_TRESHOLD_TO_REVIEW < MAX_TP_ITEMS_TO_REVIEW) {
    return Math.max(MIN_TP_ITEMS_TO_REVIEW, Math.ceil(totalItems * TP_TRESHOLD_TO_REVIEW))
  }
  return Math.min(Math.ceil(totalItems * TP_TRESHOLD_TO_REVIEW), MAX_TP_ITEMS_TO_REVIEW)
}
