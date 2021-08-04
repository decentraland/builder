import { Address } from 'web3x-es/address'
import { toBN } from 'web3x-es/utils'
import { env, utils } from 'decentraland-commons'
import { ChainId, Network, getChainName } from '@dcl/schemas'
import { getChainConfiguration } from 'decentraland-dapps/dist/lib/chainConfiguration'
import { ContractName, getContract } from 'decentraland-transactions'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { Item } from 'modules/item/types'
import { getMetadata } from 'modules/item/utils'
import { isEqual, includes } from 'lib/address'
import { sortByCreatedAt } from 'lib/sort'
import { InitializeItem, Collection, Access } from './types'
import { locations } from 'routing/locations'

export function setOnSale(collection: Collection, wallet: Wallet, isOnSale: boolean): Access[] {
  const address = getSaleAddress(wallet.networks.MATIC.chainId)
  return [{ address, hasAccess: isOnSale, collection }]
}

export function isOnSale(collection: Collection, wallet: Wallet) {
  const address = getSaleAddress(wallet.networks.MATIC.chainId)
  return includes(collection.minters, address)
}

export function getSaleAddress(chainId: ChainId) {
  return getContract(ContractName.CollectionStore, chainId).address.toLowerCase()
}

export function getCollectionEditorURL(collection: Collection, items: Item[]): string {
  return locations.itemEditor({ collectionId: collection.id, itemId: items.length > 0 ? items[0].id : undefined })
}

export function getExplorerURL(collection: Collection, chainId: ChainId) {
  if (!collection.contractAddress) {
    throw new Error('You need the collection and item to be published to get the catalyst urn')
  }

  let id = collection.id
  if (collection.isPublished) {
    const config = getChainConfiguration(chainId)
    const chainName = getChainName(config.networkMapping[Network.MATIC])
    if (!chainName) {
      throw new Error(`Could not find a valid chain name for network ${Network.MATIC} on config ${JSON.stringify(config.networkMapping)}`)
    }

    id = `urn:decentraland:${chainName.toLowerCase()}:collections-v2:${collection.contractAddress}`
  }

  // We're replacing org and hardcoding zone here because it only works on that domain for now, to avoid adding new env vars
  const EXPLORER_URL = env.get('REACT_APP_EXPLORER_URL', '').replace('.org', '.zone')
  return `${EXPLORER_URL}?WITH_COLLECTIONS=${id}`
}

export function getCollectionBaseURI() {
  return `${env.get('REACT_APP_PEER_URL', '')}/lambdas/collections/standard/erc721/`
}

export function getCollectionSymbol(collection: Collection) {
  const vowelLessName = collection.name.replace(/a|e|i|o|u|\s/g, '')
  return 'DCL-' + vowelLessName.toUpperCase()
}

export function toInitializeItems(items: Item[]): InitializeItem[] {
  return items.sort(sortByCreatedAt).map(toInitializeItem)
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
  return !!collection && [collection.owner, ...collection.managers, ...collection.minters].some(addr => isEqual(addr, address))
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

export function isEditable(collection: Collection) {
  return !collection.isApproved
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
