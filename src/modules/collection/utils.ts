import { ethers } from 'ethers'
import { ChainId } from '@dcl/schemas'
import { Env } from '@dcl/ui-env'
import { ContractName, getContract } from 'decentraland-transactions'
import { getLatestOffChainMarketplaceContract } from 'decentraland-dapps/dist/lib/trades'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { config } from 'config'
import { locations } from 'routing/locations'
import { PaginationStats } from 'lib/api/pagination'
import { isEqual, includes } from 'lib/address'
import { decodeURN, isThirdParty, URNType } from 'lib/urn'
import { getFirstWearableOrItem } from 'modules/item/utils'
import { Item, SyncStatus } from 'modules/item/types'
import { Collection, Access, Mint, CollectionType } from './types'
import { MAX_TP_ITEMS_TO_REVIEW, MIN_TP_ITEMS_TO_REVIEW, TP_TRESHOLD_TO_REVIEW } from './constants'
import { CollectionPaginationData } from './reducer'

export const UNSYNCED_COLLECTION_ERROR_PREFIX = 'UnsyncedCollection:'

export function setOnSale(collection: Collection, wallet: Wallet, isOnSale: boolean): Access[] {
  const address = getSaleAddress(wallet.networks.MATIC.chainId)
  return [{ address, hasAccess: isOnSale, collection }]
}

export function enableSaleOffchain(collection: Collection, wallet: Wallet, isOnSale: boolean): Access[] {
  const chainId = wallet.networks.MATIC.chainId

  // Enabling grants the newest version only: that is the one trades are signed against, and the minter
  // has to be the same contract as the signature domain or the mint reverts.
  if (isOnSale) {
    return [{ address: getLatestOffchainSale(chainId).address, hasAccess: true, collection }]
  }

  // Disabling has to revoke every version the collection actually holds. Revoking only the newest leaves
  // an older marketplace as a minter, so listings on that version stay sellable after the user turns
  // off-chain sale off, and isEnableForSaleOffchain — which accepts any version — still reports it as on
  // sale. Falls back to the newest when the collection holds none, matching the previous single-entry
  // shape rather than sending the contract empty arrays.
  const authorized = getOffchainSaleAddresses(chainId).filter(address => includes(collection.minters, address))
  const toRevoke = authorized.length ? authorized : [getLatestOffchainSale(chainId).address]

  return toRevoke.map(address => ({ address, hasAccess: false, collection }))
}

export function isEnableForSaleOffchain(collection: Collection, wallet: Wallet) {
  // Any version, not just the newest: a collection listed through an older marketplace is still on sale,
  // and narrowing this to the current version would make every existing listing look unlisted.
  return getOffchainSaleAddresses(wallet.networks.MATIC.chainId).some(address => includes(collection.minters, address))
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

/** Test oracle: no production caller. Specs use it to name one specific version by address. */
export function getOffchainSaleAddress(chainId: ChainId) {
  return getContract(ContractName.OffChainMarketplace, chainId).address.toLowerCase()
}

/** Test oracle: no production caller. Specs use it to name one specific version by address. */
export function getOffchainV2SaleAddress(chainId: ChainId) {
  return getContract(ContractName.OffChainMarketplaceV2, chainId).address.toLowerCase()
}

/** Test oracle: no production caller. Specs use it to name one specific version by address. */
export function getOffchainV3SaleAddress(chainId: ChainId) {
  return getContract(ContractName.OffChainMarketplaceV3, chainId).address.toLowerCase()
}

/**
 * Every off-chain marketplace version, newest first. Used ONLY to enumerate what a collection might still
 * hold minter rights on, which is Builder's own concern: a collection listed before V2 keeps V1 rights,
 * and disabling off-chain sale has to revoke whichever ones it actually holds.
 *
 * Deliberately NOT the source of the "latest" version — see getLatestOffchainSale.
 */
const OFFCHAIN_SALE_CONTRACT_NAMES = [
  ContractName.OffChainMarketplaceV3,
  ContractName.OffChainMarketplaceV2,
  ContractName.OffChainMarketplace
]

/**
 * The newest off-chain marketplace deployed on the chain.
 *
 * Delegates to decentraland-dapps rather than repeating its candidate order, because this address is the
 * one Builder grants minter rights to and it has to be the same contract dapps signs the trade against or
 * the mint reverts. Two lists that merely agree today drift the next time a version is added; one source
 * cannot. Builder still needs its own list above, but for a different question — every version a
 * collection might hold, not the current one.
 */
export function getLatestOffchainSale(chainId: ChainId): { contractName: ContractName; address: string } {
  const address = getLatestOffChainMarketplaceContract(chainId).address.toLowerCase()

  // The NAME is resolved against Builder's own list, on this chain, rather than through getContractName.
  // Two reasons. getContractName reverse-scans Builder's copy of the registry while the address comes from
  // dapps' copy, so the moment their semver ranges resolve different registries it throws — uncaught, inside
  // the put-for-sale submit handler. And it matches on any chain, so a deterministic address reused under
  // another name elsewhere would silently mislabel the authorization modal. The name is a display label; it
  // must never be able to abort a sale, hence the fallback. The ADDRESS is what actually gets granted, and
  // that still comes from dapps.
  const contractName =
    OFFCHAIN_SALE_CONTRACT_NAMES.find(name => {
      try {
        return getContract(name, chainId).address.toLowerCase() === address
      } catch {
        return false
      }
    }) ?? ContractName.OffChainMarketplaceV2

  return { contractName, address }
}

/** Every off-chain marketplace version deployed on the chain, for "is this collection listed" checks. */
export function getOffchainSaleAddresses(chainId: ChainId): string[] {
  return OFFCHAIN_SALE_CONTRACT_NAMES.reduce<string[]>((addresses, contractName) => {
    try {
      addresses.push(getContract(contractName, chainId).address.toLowerCase())
    } catch (error) {
      // Version not deployed on this chain.
    }
    return addresses
  }, [])
}

export function getCollectionEditorURL(collection: Collection, items: Item[]): string {
  return locations.itemEditor({
    collectionId: collection.id,
    itemId: getFirstWearableOrItem(items)?.id
  })
}

export function getExplorerURL({
  collectionId,
  item_ids,
  position
}: {
  collectionId?: string
  item_ids?: string[]
  position?: { x: number; y: number }
}): string {
  if (!collectionId && !item_ids) {
    throw new Error('Either a collection or item ids must be specified to get the explorer url')
  }
  const EXPLORER_URL = config.get('EXPLORER_URL', '')
  const BUILDER_SERVER_URL = config.get('BUILDER_SERVER_URL', '')
  let URL = `${EXPLORER_URL}?BUILDER_SERVER_URL=${BUILDER_SERVER_URL}&DEBUG_MODE=true`

  if (config.is(Env.DEVELOPMENT)) {
    URL += '&NETWORK=sepolia&dclenv=zone'
  } else {
    const PEER_TESTING_URL = config.get('PEER_TESTING_URL', '')
    URL += `&CATALYST=${PEER_TESTING_URL}`
  }

  if (config.is(Env.STAGING)) {
    URL += `&dclenv=today`
  }

  if (collectionId) {
    URL += `&WITH_COLLECTIONS=${collectionId}&self-preview-builder-collections=${collectionId}`
  } else if (item_ids) {
    URL += `&WITH_ITEMS=${item_ids.join(',')}`
  }

  if (position) {
    URL += `&position=${position.x},${position.y}`
  }

  return URL
}

export function getCollectionBaseURI() {
  return config.get('ERC721_COLLECTION_BASE_URI', '')
}

export function isThirdPartyCollection(collection: Collection) {
  const collectionType = getCollectionType(collection)
  return collectionType === CollectionType.THIRD_PARTY
}

export function getCollectionType(collection: Collection): CollectionType {
  const { type } = decodeURN(collection.urn)

  switch (type) {
    case URNType.COLLECTIONS_THIRDPARTY:
      return CollectionType.THIRD_PARTY
    case URNType.COLLECTIONS_V2:
    case URNType.BASE_AVATARS:
      return CollectionType.STANDARD
    default:
      throw new Error(`Tried to get a collection type from an invalid URN: ${collection.urn}` as unknown as string)
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

export class ThirdPartyBuildEntityError extends Error {
  constructor(public item: Item) {
    super("Failed to download the entity's contents")
    this.item = item
  }
}
export class ThirdPartyDeploymentError extends Error {
  constructor(public item: Item) {
    super('Failed to deploy the entity')
    this.item = item
  }
}

export class ThirdPartyCurationUpdateError extends Error {
  constructor(public item: Item) {
    super('Failed to update curation')
    this.item = item
  }
}

export type ThirdPartyError = ThirdPartyBuildEntityError | ThirdPartyDeploymentError

export const toPaginationStats = (collectionPaginationData: CollectionPaginationData): PaginationStats => {
  const { limit, currentPage, totalPages, total } = collectionPaginationData
  return {
    limit,
    total,
    pages: totalPages,
    page: currentPage
  }
}

export const getFiatGatewayCommodityAmount = (unitPrice: string, items: number) => {
  const unitPriceWei = ethers.BigNumber.from(unitPrice)
  const totalPriceWei = unitPriceWei.mul(items)
  const totalPriceEth = Number(ethers.utils.formatEther(totalPriceWei.toString())) * 1.005 // 0.5% extra to safeguard against price fluctuations.
  const factor = Math.pow(10, 8)

  // Wert supports up to 8 decimal places.
  // It is important to round up to this amount of decimal places to avoid issues with the widget.
  return Math.ceil(totalPriceEth * factor) / factor
}

export const USD_CENTS_PER_CREDIT = 10

export function weiToUsdCents(weiUsd: string): number {
  // Integer arithmetic to avoid IEEE 754 rounding mismatches with the credits-server. 1 cent = 10^16 wei.
  const WEI_PER_CENT = ethers.BigNumber.from(10).pow(16)
  const wei = ethers.BigNumber.from(weiUsd)
  const cents = wei.div(WEI_PER_CENT)
  return (wei.mod(WEI_PER_CENT).isZero() ? cents : cents.add(1)).toNumber()
}

export function shopCreditsNeededForPrice(weiUsd: string): number {
  return Math.ceil(weiToUsdCents(weiUsd) / USD_CENTS_PER_CREDIT)
}
