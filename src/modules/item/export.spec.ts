import { BodyShape, Emote, EntityType, Rarity, Wearable, WearableCategory } from '@dcl/schemas'
import { buildEntity } from 'dcl-catalyst-client/dist/client/utils/DeploymentBuilder'
import { calculateMultipleHashesADR32, calculateMultipleHashesADR32LegacyQmHash } from '@dcl/hashing'
import { BuilderAPI } from 'lib/api/builder'
import { Collection } from 'modules/collection/types'
import { mockedItem } from 'specs/item'
import { buildItemEntity, buildStandardWearableContentHash, hasOldHashedContents, isOldHash } from './export'
import { EntityHashingType, Item, ItemType } from './types'

jest.mock('dcl-catalyst-client/dist/client/utils/DeploymentBuilder', () => ({
  buildEntity: jest.fn()
}))

jest.mock('@dcl/hashing', () => ({
  calculateMultipleHashesADR32: jest.fn(),
  calculateMultipleHashesADR32LegacyQmHash: jest.fn()
}))

jest.mock('lib/urn', () => ({
  buildCatalystItemURN: (contractAddress: string, tokenId: string) =>
    `urn:decentraland:matic:collections-v2:${contractAddress}:${tokenId}`
}))

describe('when checking if a hash was generated with an older algorithm', () => {
  describe('and the hash was generated with an older algorithm', () => {
    it('should return true', () => {
      expect(isOldHash('QmVMJ6skaVVKN61NkB4RUrXj1LZ4oF7X74wwaTwxrrtAVy')).toBe(true)
    })
  })

  describe('and the hash was generated with a newer algorithm', () => {
    it('should return false', () => {
      expect(isOldHash('bafybeib42stvo6a5dxxaj4uzolicqeedv2u3cfpoo2d2qylz332zc2w5ra')).toBe(false)
    })
  })
})

describe('when checking if an item has hashed contents with an older algorithm', () => {
  let item: Item

  beforeEach(() => {
    item = { ...mockedItem }
  })

  describe('and the item has its contents hashed with and old algorithm', () => {
    beforeEach(() => {
      item = {
        ...item,
        contents: Object.fromEntries(Object.entries(item.contents).map(([key]) => [key, 'Qmf7dnGi5fyF9AwdJGzVnFCUUGBB8w2mW1v6AZAWh7rJVd']))
      }
    })

    it('should return true', () => {
      expect(hasOldHashedContents(item)).toBe(true)
    })
  })

  describe('and the item has its contents hashed with a newer algorithm', () => {
    beforeEach(() => {
      item = {
        ...item,
        contents: Object.fromEntries(
          Object.entries(item.contents).map(([key]) => [key, 'bafkreih3bdgomxm4otdlm7c4jjwufkwa36qykud2s7cp6touxm24elcaxa'])
        )
      }
    })

    it('should return false', () => {
      expect(hasOldHashedContents(item)).toBe(false)
    })
  })
})

// CIDv1 base32 hash of empty (0-byte) content; matches the EMPTY_CONTENT_HASH constant in utils.ts.
const EMPTY_CONTENT_HASH = 'bafkreihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku'
const MODEL_HASH = 'bafkreimodel0000000000000000000000000000000000000000000000000'
const THUMBNAIL_HASH = 'bafkreithumb0000000000000000000000000000000000000000000000000'
const IMAGE_HASH = 'bafkreiimage0000000000000000000000000000000000000000000000000'

describe('when building an item entity for deployment', () => {
  let collection: Collection
  let legacyBuilderClient: BuilderAPI
  let buildEntityMock: jest.Mock

  beforeEach(() => {
    collection = { contractAddress: '0x0000000000000000000000000000000000000001' } as Collection
    buildEntityMock = buildEntity as jest.Mock
    buildEntityMock.mockResolvedValue({ entityId: 'anEntityId', files: new Map() })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('and the item is a wearable whose representation references a directory entry and a 0-byte file', () => {
    let item: Item

    beforeEach(() => {
      item = {
        ...mockedItem,
        tokenId: '1',
        contents: {
          'male/model.glb': MODEL_HASH,
          'male/': 'bafkreidirectory',
          'male/empty.bin': EMPTY_CONTENT_HASH,
          'thumbnail.png': THUMBNAIL_HASH,
          'image.png': IMAGE_HASH
        },
        data: {
          ...mockedItem.data,
          representations: [
            {
              bodyShapes: [BodyShape.MALE],
              mainFile: 'male/model.glb',
              contents: ['male/model.glb', 'male/', 'male/empty.bin', 'thumbnail.png'],
              overrideReplaces: [],
              overrideHides: []
            }
          ]
        }
      }

      legacyBuilderClient = {
        fetchContents: jest.fn().mockResolvedValue({
          'male/model.glb': new Blob(['model']),
          'male/': new Blob(),
          'male/empty.bin': new Blob(),
          'thumbnail.png': new Blob(['thumb']),
          'image.png': new Blob(['image'])
        })
      } as unknown as BuilderAPI
    })

    it('should strip the directory entry and the 0-byte file from the representation passed to buildEntity', async () => {
      await buildItemEntity(legacyBuilderClient, collection, item)

      expect(buildEntityMock).toHaveBeenCalledTimes(1)
      const passedMetadata = buildEntityMock.mock.calls[0][0].metadata as Wearable
      expect(passedMetadata.data.representations).toEqual([
        expect.objectContaining({
          bodyShapes: [BodyShape.MALE],
          mainFile: 'male/model.glb',
          contents: ['male/model.glb', 'thumbnail.png']
        })
      ])
    })

    it('should deploy as a WEARABLE entity targeting the catalyst URN', async () => {
      await buildItemEntity(legacyBuilderClient, collection, item)

      const call = buildEntityMock.mock.calls[0][0]
      expect(call.type).toBe(EntityType.WEARABLE)
      expect(call.pointers).toEqual([(call.metadata as Wearable).id])
    })
  })

  describe('and the item is an emote whose representation references a directory entry and a 0-byte file', () => {
    let item: Item<ItemType.EMOTE>

    beforeEach(() => {
      item = ({
        ...mockedItem,
        type: ItemType.EMOTE,
        tokenId: '2',
        rarity: Rarity.LEGENDARY,
        contents: {
          'animation.glb': MODEL_HASH,
          'animation/': 'bafkreidirectory',
          'animation/empty.bin': EMPTY_CONTENT_HASH,
          'thumbnail.png': THUMBNAIL_HASH,
          'image.png': IMAGE_HASH
        },
        data: {
          category: 'dance',
          tags: [],
          loop: false,
          representations: [
            {
              bodyShapes: [BodyShape.MALE, BodyShape.FEMALE],
              mainFile: 'animation.glb',
              contents: ['animation.glb', 'animation/', 'animation/empty.bin', 'thumbnail.png']
            }
          ]
        }
      } as unknown) as Item<ItemType.EMOTE>

      legacyBuilderClient = {
        fetchContents: jest.fn().mockResolvedValue({
          'animation.glb': new Blob(['animation']),
          'animation/': new Blob(),
          'animation/empty.bin': new Blob(),
          'thumbnail.png': new Blob(['thumb']),
          'image.png': new Blob(['image'])
        })
      } as unknown as BuilderAPI
    })

    it('should strip the directory entry and the 0-byte file from the emote representation passed to buildEntity', async () => {
      await buildItemEntity(legacyBuilderClient, collection, item)

      expect(buildEntityMock).toHaveBeenCalledTimes(1)
      const passedMetadata = buildEntityMock.mock.calls[0][0].metadata as Emote
      expect(passedMetadata.emoteDataADR74.representations).toEqual([
        expect.objectContaining({
          mainFile: 'animation.glb',
          contents: ['animation.glb', 'thumbnail.png']
        })
      ])
    })

    it('should deploy as an EMOTE entity', async () => {
      await buildItemEntity(legacyBuilderClient, collection, item)
      expect(buildEntityMock.mock.calls[0][0].type).toBe(EntityType.EMOTE)
    })
  })
})

describe('when building the standard wearable content hash', () => {
  let collection: Collection
  let item: Item
  let calculateAdr32Mock: jest.Mock
  let calculateAdr32LegacyMock: jest.Mock

  beforeEach(() => {
    collection = { contractAddress: '0x0000000000000000000000000000000000000001' } as Collection
    item = {
      ...mockedItem,
      tokenId: '1',
      contents: {
        'male/model.glb': MODEL_HASH,
        'male/': 'bafkreidirectory',
        'male/empty.bin': EMPTY_CONTENT_HASH,
        'thumbnail.png': THUMBNAIL_HASH,
        'image.png': IMAGE_HASH
      },
      data: {
        ...mockedItem.data,
        category: WearableCategory.HAT,
        representations: [
          {
            bodyShapes: [BodyShape.MALE],
            mainFile: 'male/model.glb',
            contents: ['male/model.glb', 'male/', 'male/empty.bin', 'thumbnail.png'],
            overrideReplaces: [],
            overrideHides: []
          }
        ]
      }
    }
    calculateAdr32Mock = calculateMultipleHashesADR32 as jest.Mock
    calculateAdr32LegacyMock = calculateMultipleHashesADR32LegacyQmHash as jest.Mock
    calculateAdr32Mock.mockResolvedValue({ hash: 'newHash' })
    calculateAdr32LegacyMock.mockResolvedValue({ hash: 'oldHash' })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('and the hashing type is V1', () => {
    it('should pass content and metadata with stripped representations to the V1 hasher and return its hash', async () => {
      const result = await buildStandardWearableContentHash(collection, item)

      expect(result).toBe('newHash')
      expect(calculateAdr32LegacyMock).not.toHaveBeenCalled()
      expect(calculateAdr32Mock).toHaveBeenCalledTimes(1)
      const [content, metadata] = calculateAdr32Mock.mock.calls[0]
      expect(content.map((c: { file: string }) => c.file).sort()).toEqual(['image.png', 'male/model.glb', 'thumbnail.png'])
      expect((metadata as Wearable).data.representations).toEqual([
        expect.objectContaining({
          mainFile: 'male/model.glb',
          contents: ['male/model.glb', 'thumbnail.png']
        })
      ])
    })
  })

  describe('and the hashing type is V0', () => {
    it('should pass content and metadata with stripped representations to the legacy hasher and return its hash', async () => {
      const result = await buildStandardWearableContentHash(collection, item, EntityHashingType.V0)

      expect(result).toBe('oldHash')
      expect(calculateAdr32Mock).not.toHaveBeenCalled()
      expect(calculateAdr32LegacyMock).toHaveBeenCalledTimes(1)
      const [, metadata] = calculateAdr32LegacyMock.mock.calls[0]
      expect((metadata as Wearable).data.representations[0].contents).toEqual(['male/model.glb', 'thumbnail.png'])
    })
  })
})
