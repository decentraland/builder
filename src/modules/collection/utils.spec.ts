import { ChainId } from '@dcl/schemas'
import * as dappsEth from 'decentraland-dapps/dist/lib/eth'
import { buildCatalystItemURN, buildThirdPartyURN } from 'lib/urn'
import { Item, WearableBodyShape } from 'modules/item/types'
import { Collection, CollectionType } from 'modules/collection/types'
import { buildItemContentHash } from 'modules/item/export'
import { Mint } from './types'
import { getTotalAmountOfMintedItems, isLocked, getCollectionType, getLatestItemHash, isTPCollection } from './utils'

jest.mock('modules/item/export')

const buildItemContentHashMock = buildItemContentHash as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
})

describe('when counting the amount of minted items', () => {
  let mints: Mint[]
  let item: Item

  beforeEach(() => {
    item = { id: 'anId' } as Item
  })

  describe('having no mints', () => {
    beforeEach(() => {
      mints = []
    })

    it('should return 0', () => {
      expect(getTotalAmountOfMintedItems(mints)).toBe(0)
    })
  })

  describe('having one mint of amount 3', () => {
    beforeEach(() => {
      mints = [{ address: 'anAddress', amount: 3, item }]
    })

    it('should return 3', () => {
      expect(getTotalAmountOfMintedItems(mints)).toBe(3)
    })
  })

  describe('having two mints of amount 2', () => {
    beforeEach(() => {
      mints = [
        { address: 'anAddress', amount: 2, item },
        { address: 'anotherAddress', amount: 2, item }
      ]
    })
    it('should return 4', () => {
      expect(getTotalAmountOfMintedItems(mints)).toBe(4)
    })
  })
})

describe('when checking collection locks', () => {
  let collection: Collection

  describe('when the collection does not have a lock', () => {
    beforeEach(() => {
      collection = { lock: undefined, isPublished: false } as Collection
    })
    it('should return false', () => {
      expect(isLocked(collection)).toBe(false)
    })
  })

  describe('when the collection is published', () => {
    beforeEach(() => {
      collection = { lock: undefined, isPublished: false } as Collection
    })
    it('should return false', () => {
      expect(isLocked(collection)).toBe(false)
    })
  })

  describe('when the collection has an expired lock and is published', () => {
    beforeEach(() => {
      const lock = Date.now() - 3 * 60 * 60 * 1000 // 3 days in milliseconds
      collection = { lock, isPublished: true } as Collection
    })
    it('should return false', () => {
      expect(isLocked(collection)).toBe(false)
    })
  })

  describe('when the collection has a valid lock and is not published', () => {
    beforeEach(() => {
      const lock = Date.now() - 2 * 60 * 1000 // 2 minutes in milliseconds
      collection = { lock, isPublished: false } as Collection
    })
    it('should return true', () => {
      expect(isLocked(collection)).toBe(true)
    })
  })
})

describe('when getting the collection type', () => {
  let collection: Collection

  describe('when the collection has a base avatar URN', () => {
    beforeEach(() => {
      collection = { id: 'aCollection', urn: WearableBodyShape.FEMALE.toString() } as Collection
    })

    it('should return false', () => {
      expect(getCollectionType(collection)).toBe(CollectionType.DECENTRALAND)
    })
  })

  describe('when the collection has a collections v2 URN', () => {
    beforeEach(() => {
      jest.spyOn(dappsEth, 'getChainIdByNetwork').mockReturnValueOnce(ChainId.MATIC_MAINNET)
      collection = { id: 'aCollection', urn: buildCatalystItemURN('0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8', '22') } as Collection
    })

    it('should return false', () => {
      expect(getCollectionType(collection)).toBe(CollectionType.DECENTRALAND)
    })
  })

  describe('when the collection has a third party URN', () => {
    beforeEach(() => {
      jest.spyOn(dappsEth, 'getChainIdByNetwork').mockReturnValueOnce(ChainId.MATIC_MAINNET)
      collection = { id: 'aCollection', urn: buildThirdPartyURN('thirdpartyname', 'collection-id', '22') } as Collection
    })

    it('should return true', () => {
      expect(getCollectionType(collection)).toBe(CollectionType.THIRD_PARTY)
    })
  })
})

describe('when getting the latest item hash', () => {
  let item: Item
  let resultHash: string
  let collection: Collection

  beforeEach(() => {
    collection = { id: 'aCollection' } as Collection
  })

  describe('and the item has a hash coming from the server', () => {
    beforeEach(() => {
      resultHash = 'aHash'
      item = { id: 'anId', currentContentHash: resultHash } as Item
    })

    it.skip('should return the hash coming from the server', () => {
      return expect(getLatestItemHash(collection, item)).resolves.toEqual(resultHash)
    })
  })

  describe("and the item doesn't have a hash coming from the server", () => {
    beforeEach(() => {
      resultHash = 'aHash'
      buildItemContentHashMock.mockResolvedValueOnce(resultHash)
      item = { id: 'anId', currentContentHash: null } as Item
    })

    it("should return the computed hash of the item's entity", () => {
      return expect(getLatestItemHash(collection, item)).resolves.toEqual(resultHash)
    })
  })
})

describe('when checking if a collection is of type third party', () => {
  let collection: Collection

  describe('and the collection is not a third party collection', () => {
    beforeEach(() => {
      collection = {
        id: 'aCollection',
        urn: 'urn:decentraland:ropsten:collections-v2:0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8'
      } as Collection
    })

    it('should return false', () => {
      expect(isTPCollection(collection)).toBe(false)
    })
  })

  describe('and the collection is a third party collection', () => {
    beforeEach(() => {
      collection = {
        id: 'aCollection',
        urn: 'urn:decentraland:matic:collections-thirdparty:some-tp-name:the-collection-id:a-wonderful-token-id'
      } as Collection
    })

    it('should return true', () => {
      expect(isTPCollection(collection)).toBe(true)
    })
  })
})
