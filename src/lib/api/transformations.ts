import { RemoteItem } from '@dcl/builder-client'
import { Item, WearableData } from 'modules/item/types'

export function fromRemoteItem(remoteItem: RemoteItem): Item {
  const item: Item = {
    id: remoteItem.id,
    name: remoteItem.name,
    thumbnail: remoteItem.thumbnail,
    owner: remoteItem.eth_address,
    description: remoteItem.description ?? '',
    isPublished: remoteItem.is_published,
    isApproved: remoteItem.is_approved,
    inCatalyst: remoteItem.in_catalyst,
    type: remoteItem.type,
    data: remoteItem.data as WearableData,
    contents: remoteItem.contents,
    blockchainContentHash: remoteItem.content_hash,
    currentContentHash: remoteItem.local_content_hash,
    catalystContentHash: remoteItem.catalyst_content_hash,
    metrics: remoteItem.metrics,
    createdAt: +new Date(remoteItem.created_at),
    updatedAt: +new Date(remoteItem.created_at)
  }

  if (remoteItem.collection_id) item.collectionId = remoteItem.collection_id
  if (remoteItem.blockchain_item_id) item.tokenId = remoteItem.blockchain_item_id
  if (remoteItem.price) item.price = remoteItem.price
  if (remoteItem.urn) item.urn = remoteItem.urn
  if (remoteItem.beneficiary) item.beneficiary = remoteItem.beneficiary
  if (remoteItem.rarity) item.rarity = remoteItem.rarity
  if (remoteItem.total_supply !== null) item.totalSupply = remoteItem.total_supply // 0 is false

  return item
}
