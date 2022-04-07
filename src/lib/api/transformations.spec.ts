import { ItemType, RemoteItem } from '@dcl/builder-client'
import { Rarity, WearableBodyShape, WearableCategory } from '@dcl/schemas'
import { Item, ItemRarity } from 'modules/item/types'
import { fromRemoteItem } from './transformations'

describe('when converting a RemoteItem into an Item', () => {
  let remoteItem: RemoteItem
  let item: Item

  beforeEach(() => {
    const now = 1646342552
    remoteItem = {
      id: 'anId',
      name: 'name',
      description: 'aDescription',
      thumbnail: 'thumbnail.png',
      eth_address: '0x0',
      collection_id: null,
      blockchain_item_id: null,
      total_supply: 0,
      price: null,
      urn: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2:tercer-fiesta-2',
      beneficiary: null,
      rarity: Rarity.LEGENDARY,
      type: ItemType.WEARABLE,
      data: {
        category: WearableCategory.HAT,
        representations: [
          {
            bodyShapes: [WearableBodyShape.MALE],
            mainFile: 'model.glb',
            contents: ['model.glb'],
            overrideHides: [WearableCategory.FEET],
            overrideReplaces: [WearableCategory.FACIAL_HAIR]
          }
        ],
        replaces: [WearableCategory.EYES],
        hides: [WearableCategory.HAT],
        tags: ['aTag', 'anotherTag']
      },
      metrics: {
        triangles: 0,
        materials: 0,
        meshes: 0,
        bodies: 0,
        entities: 0,
        textures: 0
      },
      contents: {},
      content_hash: 'someHash',
      local_content_hash: 'someOtherHash',
      catalyst_content_hash: 'aCatalystHash',
      is_published: false,
      is_approved: true,
      in_catalyst: true,
      created_at: now,
      updated_at: now
    }

    item = {
      id: 'anId',
      name: 'name',
      description: 'aDescription',
      thumbnail: 'thumbnail.png',
      owner: '0x0',
      urn: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2:tercer-fiesta-2',
      rarity: ItemRarity.LEGENDARY,
      type: ItemType.WEARABLE,
      totalSupply: 0,
      data: {
        category: WearableCategory.HAT,
        representations: [
          {
            bodyShapes: [WearableBodyShape.MALE],
            mainFile: 'model.glb',
            contents: ['model.glb'],
            overrideHides: [WearableCategory.FEET],
            overrideReplaces: [WearableCategory.FACIAL_HAIR]
          }
        ],
        replaces: [WearableCategory.EYES],
        hides: [WearableCategory.HAT],
        tags: ['aTag', 'anotherTag']
      },
      metrics: {
        triangles: 0,
        materials: 0,
        meshes: 0,
        bodies: 0,
        entities: 0,
        textures: 0
      },
      contents: {},
      blockchainContentHash: 'someHash',
      currentContentHash: 'someOtherHash',
      catalystContentHash: 'aCatalystHash',
      isPublished: false,
      isApproved: true,
      inCatalyst: true,
      createdAt: now,
      updatedAt: now
    }
  })

  it('should return the converted item', () => {
    expect(fromRemoteItem(remoteItem)).toEqual(item)
  })
})
