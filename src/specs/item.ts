import { LocalItem, Rarity, WearableCategory as LocalItemWearableCategory } from '@dcl/builder-client'
import { Item, ItemRarity, ItemType, WearableBodyShape, WearableCategory } from 'modules/item/types'

export const mockedItem: Item = {
  type: ItemType.WEARABLE,
  id: 'anItemId',
  name: 'anItemName',
  thumbnail: 'thumbnail.png',
  description: 'aDescription',
  rarity: ItemRarity.LEGENDARY,
  metrics: {
    triangles: 0,
    materials: 0,
    meshes: 0,
    bodies: 0,
    entities: 0,
    textures: 0
  },
  createdAt: 0,
  updatedAt: 0,
  owner: '0x0',
  isPublished: false,
  isApproved: false,
  inCatalyst: false,
  contents: { 'anItemContent.glb': 'theFileHash', 'thumbnail.png': 'theThumbnailHash' },
  blockchainContentHash: null,
  currentContentHash: null,
  catalystContentHash: null,
  data: {
    category: WearableCategory.HAT,
    representations: [
      {
        bodyShapes: [WearableBodyShape.MALE],
        mainFile: 'anItemContent.glb',
        contents: ['anItemContent.glb'],
        overrideReplaces: [],
        overrideHides: []
      }
    ],
    replaces: [WearableCategory.HELMET],
    hides: [WearableCategory.HAIR],
    tags: ['aHat']
  }
}

export const mockedLocalItem: LocalItem = {
  type: ItemType.WEARABLE as any,
  id: mockedItem.id,
  name: mockedItem.name,
  thumbnail: mockedItem.thumbnail,
  description: mockedItem.description,
  collection_id: null,
  content_hash: null,
  urn: null,
  rarity: Rarity.LEGENDARY,
  metrics: {
    triangles: 0,
    materials: 0,
    meshes: 0,
    bodies: 0,
    entities: 0,
    textures: 0
  },
  contents: mockedItem.contents,
  data: {
    category: LocalItemWearableCategory.HAT,
    representations: [
      {
        bodyShapes: [WearableBodyShape.MALE],
        mainFile: 'anItemContent.glb',
        contents: ['anItemContent.glb', 'thumbnail.png'],
        overrideReplaces: [],
        overrideHides: []
      }
    ],
    replaces: [LocalItemWearableCategory.HELMET],
    hides: [LocalItemWearableCategory.HAIR],
    tags: ['aHat']
  }
}

// export const mockedRemoteItem: RemoteItem = {
export const mockedRemoteItem: any = {
  type: ItemType.WEARABLE as any,
  id: mockedItem.id,
  name: mockedItem.name,
  thumbnail: mockedItem.thumbnail,
  description: mockedItem.description,
  eth_address: '0x0',
  collection_id: null,
  blockchain_item_id: null,
  total_supply: null,
  price: null,
  urn: null,
  beneficiary: null,
  content_hash: null,
  rarity: Rarity.LEGENDARY,
  metrics: {
    triangles: 0,
    materials: 0,
    meshes: 0,
    bodies: 0,
    entities: 0,
    textures: 0
  },
  contents: mockedItem.contents,
  data: {
    category: LocalItemWearableCategory.HAT,
    representations: [
      {
        bodyShapes: [WearableBodyShape.MALE],
        mainFile: 'anItemContent.glb',
        contents: ['anItemContent.glb'],
        overrideReplaces: [],
        overrideHides: []
      }
    ],
    replaces: [LocalItemWearableCategory.HELMET],
    hides: [LocalItemWearableCategory.HAIR],
    tags: ['aHat']
  },
  is_published: false,
  is_approved: false,
  in_catalyst: false,
  created_at: 0,
  updated_at: 0,
  local_content_hash: 'someHash',
  catalyst_content_hash: null
}

export const mockedItemContents = { 'anItemContent.glb': new Blob(), 'thumbnail.png': new Blob() }
