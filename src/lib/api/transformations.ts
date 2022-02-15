import { RemoteItem } from '@dcl/builder-client'
import { Rarity } from '@dcl/schemas'
import { Item, ItemRarity } from 'modules/item/types'

export function fromRemoteItem(remoteItem: RemoteItem) {
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
    data: remoteItem.data,
    contents: remoteItem.contents,
    contentHash: remoteItem.content_hash,
    metrics: remoteItem.metrics,
    createdAt: +new Date(remoteItem.created_at),
    updatedAt: +new Date(remoteItem.created_at)
  }

  if (remoteItem.collection_id) item.collectionId = remoteItem.collection_id
  if (remoteItem.blockchain_item_id) item.tokenId = remoteItem.blockchain_item_id
  if (remoteItem.price) item.price = remoteItem.price
  if (remoteItem.urn) item.urn = remoteItem.urn
  if (remoteItem.beneficiary) item.beneficiary = remoteItem.beneficiary
  if (remoteItem.rarity) item.rarity = rarityToItemRarity(remoteItem.rarity)
  if (remoteItem.total_supply !== null) item.totalSupply = remoteItem.total_supply // 0 is false

  return item
}

function rarityToItemRarity(rarity: Rarity): ItemRarity {
  switch (rarity) {
    case Rarity.UNIQUE:
      return ItemRarity.UNIQUE
    case Rarity.MYTHIC:
      return ItemRarity.MYTHIC
    case Rarity.LEGENDARY:
      return ItemRarity.LEGENDARY
    case Rarity.EPIC:
      return ItemRarity.EPIC
    case Rarity.RARE:
      return ItemRarity.RARE
    case Rarity.UNCOMMON:
      return ItemRarity.UNCOMMON
    case Rarity.COMMON:
      return ItemRarity.COMMON
    default:
      throw new Error('Unknown rarity')
  }
}
