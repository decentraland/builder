import { EntityHashingType, Item, ItemMetadataType, ItemType, WearableBodyShape, WearableCategory, WearableRepresentation } from './types'
import {
  buildItemMetadata,
  buildZipContents,
  toThirdPartyContractItems,
  areEqualArrays,
  areEqualRepresentations,
  groupsOf,
  getLatestStandardItemContentHash
} from './utils'
import * as exportModule from './export'
import { mockedItem } from 'specs/item'
import { Collection } from 'modules/collection/types'

jest.mock('./export')

const buildStandardWearableContentHashMock = (exportModule.buildStandardWearableContentHash as unknown) as jest.Mock<
  typeof exportModule.buildStandardWearableContentHash
>

describe('when transforming third party items to be sent to a contract method', () => {
  let items: Item[]

  beforeEach(() => {
    const now = Date.now()
    items = [
      {
        createdAt: now - 2000,
        type: ItemType.WEARABLE,
        name: 'first-name',
        description: '',
        data: {
          category: WearableCategory.EARRING,
          representations: [{ bodyShapes: [WearableBodyShape.MALE] }]
        },
        urn: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2:collection-id1:token-id2',
        contents: {}
      },
      {
        createdAt: now - 1000,
        type: ItemType.WEARABLE,
        name: 'second name',
        description: 'a second description',
        data: {
          category: WearableCategory.EYEBROWS,
          representations: [{ bodyShapes: [WearableBodyShape.MALE, WearableBodyShape.FEMALE] }]
        },
        urn: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2:collection-id2:token-idb',
        contents: {}
      },
      {
        createdAt: now - 3000,
        type: ItemType.WEARABLE,
        name: 'cool beans',
        description: 'real cool',
        data: {
          category: WearableCategory.FEET,
          representations: [{ bodyShapes: [WearableBodyShape.FEMALE] }]
        },
        urn: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2:collection-id1:token-id1',
        contents: {}
      }
    ] as Item[]
  })
  it('should return a sorted array representing the third party contract items', () => {
    expect(toThirdPartyContractItems(items)).toEqual([
      ['collection-id1:token-id1', '1:w:cool beans:real cool:feet:BaseFemale'],
      ['collection-id1:token-id2', '1:w:first-name::earring:BaseMale'],
      ['collection-id2:token-idb', '1:w:second name:a second description:eyebrows:BaseMale,BaseFemale']
    ])
  })
})

describe('when building zip files and representations are equal', () => {
  it('should remove the /male and /female directories', () => {
    expect(buildZipContents({ 'male/model.glb': 'Qmhash', 'female/model.glb': 'Qmhash' }, true)).toEqual({ 'model.glb': 'Qmhash' })
  })
})

describe('when building zip files and representations are NOT equal', () => {
  it('should keep the /male and /female directories', () => {
    expect(buildZipContents({ 'male/model.glb': 'QmhashA', 'female/model.glb': 'QmhashB' }, false)).toEqual({
      'male/model.glb': 'QmhashA',
      'female/model.glb': 'QmhashB'
    })
  })
})

describe('when building the item URN', () => {
  it('should build valid item metadata', () => {
    expect(buildItemMetadata(1, ItemMetadataType.WEARABLE, 'my-name', 'my-desc', 'great-category', 'baseMale,baseFemale')).toBe(
      '1:w:my-name:my-desc:great-category:baseMale,baseFemale'
    )
  })
})

describe('when comparing two arrays', () => {
  it('should return true when the elements are the same in the same order', () => {
    expect(areEqualArrays(['a', 'b', 'c', 'd'], ['a', 'b', 'c', 'd'])).toBe(true)
  })
  it('should return true when the elements are the same in different order', () => {
    expect(areEqualArrays(['a', 'b', 'c', 'd'], ['c', 'a', 'b', 'd'])).toBe(true)
  })
  it('should return false when the first array has an extra element', () => {
    expect(areEqualArrays(['a', 'b', 'c', 'd'], ['a', 'b', 'c'])).toBe(false)
  })
  it('should return false when the second array has an extra element', () => {
    expect(areEqualArrays(['a', 'b', 'c'], ['a', 'b', 'c', 'd'])).toBe(false)
  })
  it('should return false when the elements are different', () => {
    expect(areEqualArrays(['a', 'b', 'c'], ['x', 'y', 'z'])).toBe(false)
  })
})

describe('when comparing two representations', () => {
  const male: WearableRepresentation = {
    bodyShapes: [WearableBodyShape.MALE],
    contents: ['male.glb'],
    mainFile: 'male.glb',
    overrideHides: [],
    overrideReplaces: []
  }

  const female: WearableRepresentation = {
    bodyShapes: [WearableBodyShape.FEMALE],
    contents: ['female.glb'],
    mainFile: 'female.glb',
    overrideHides: [],
    overrideReplaces: []
  }

  it('should return true when both representations are male', () => {
    expect(areEqualRepresentations([male], [male])).toBe(true)
  })
  it('should return true when both representations are female', () => {
    expect(areEqualRepresentations([female], [female])).toBe(true)
  })
  it('should return true when both representations are male and female', () => {
    expect(areEqualRepresentations([male, female], [male, female])).toBe(true)
  })
  it('should return false when the first representation is male and female and the second one is male', () => {
    expect(areEqualRepresentations([male, female], [male])).toBe(false)
  })
  it('should return false when the first representation is male and female and the second one is female', () => {
    expect(areEqualRepresentations([male, female], [female])).toBe(false)
  })
  it('should return false when the first representation is male and the second one is male and female', () => {
    expect(areEqualRepresentations([male], [male, female])).toBe(false)
  })
  it('should return false when the first representation is female and the second one is male and female', () => {
    expect(areEqualRepresentations([female], [male, female])).toBe(false)
  })
})

describe('when getting the groups of an array', () => {
  describe('and the array is empty', () => {
    it('should return an empty array', () => {
      expect(groupsOf([], 4)).toEqual([])
    })
  })

  describe('and the size of the groups is greater than the size of the array', () => {
    it('should return an array with one group with the whole array', () => {
      expect(groupsOf([1, 2, 3, 4], 7)).toEqual([[1, 2, 3, 4]])
    })
  })

  describe('and the size of the groups is 0', () => {
    it('should throw an error signaling that the size of the groups should be greater than 0', () => {
      expect(() => groupsOf([1, 2, 3, 4], 0)).toThrow(new Error('The groups size must be greater than 0'))
    })
  })

  describe('when the size of the groups is lower than the size of the array', () => {
    it('should return an array of groups with the items', () => {
      expect(groupsOf([1, 2, 3, 4], 2)).toEqual([
        [1, 2],
        [3, 4]
      ])
    })
  })
})

describe('when getting the latest content hash of a standard item', () => {
  let item: Item
  let collection: Collection

  beforeEach(() => {
    item = { ...mockedItem }
    collection = { id: 'pepe' } as Collection
  })

  describe("and the item doesn't have the catalyst content hash", () => {
    beforeEach(() => {
      item = { ...item, catalystContentHash: null }
    })

    describe('and it has the current content hash', () => {
      beforeEach(() => {
        item = { ...item, currentContentHash: 'someHash' }
      })

      it("should return the item's current content hash", () => {
        return expect(getLatestStandardItemContentHash(item, collection)).resolves.toEqual(item.currentContentHash)
      })
    })

    describe("and it doesn't have the current content hash", () => {
      beforeEach(() => {
        item = { ...item, currentContentHash: null }
        buildStandardWearableContentHashMock.mockResolvedValueOnce('someHash' as never)
      })

      it('should compute the latest content hash', () => {
        return expect(getLatestStandardItemContentHash(item, collection)).resolves.toEqual('someHash')
      })

      it('should compute the latest content hash with the V1 version', () => {
        expect(buildStandardWearableContentHashMock).toHaveBeenCalledWith(collection, item, EntityHashingType.V1)
      })
    })
  })

  describe('and the item has the catalyst content hash using v0', () => {
    beforeEach(() => {
      item = { ...item, catalystContentHash: 'QmZ4sEDbhziGhU4CjbcVh7dXPoMPM8CbCQ2giPbPNSTW4i' }
    })

    describe("and the current content hash doesn't exist", () => {
      let computedContentHash: string

      beforeEach(() => {
        item = { ...item, currentContentHash: null }
        computedContentHash = 'QmNPieKuv5z2ZpSza7rWa3nNCVq6QzadEPqTEioG7thwAX'
        buildStandardWearableContentHashMock.mockResolvedValueOnce(computedContentHash as never)
      })

      it('should return the hashed item with the v0 algorithm', () => {
        return expect(getLatestStandardItemContentHash(item, collection)).resolves.toEqual(computedContentHash)
      })

      it('should have computed the v0 hash', () => {
        expect(buildStandardWearableContentHashMock).toHaveBeenCalledWith(collection, item, EntityHashingType.V0)
      })
    })

    describe('and the current content hash exists and is v0', () => {
      beforeEach(() => {
        item = { ...item, currentContentHash: 'QmNPieKuv5z2ZpSza7rWa3nNCVq6QzadEPqTEioG7thwAX' }
      })

      it("should return the item's current content hash", () => {
        return expect(getLatestStandardItemContentHash(item, collection)).resolves.toEqual(item.currentContentHash)
      })
    })

    describe('and the current content hash exists and is v1', () => {
      let computedContentHash: string

      beforeEach(() => {
        computedContentHash = 'QmNPieKuv5z2ZpSza7rWa3nNCVq6QzadEPqTEioG7thwAX'
        item = { ...item, currentContentHash: null }
      })

      it('should return the hashed item with the v0 algorithm', () => {
        return expect(getLatestStandardItemContentHash(item, collection)).resolves.toEqual(computedContentHash)
      })

      it('should have computed the v0 hash', () => {
        expect(buildStandardWearableContentHashMock).toHaveBeenCalledWith(collection, item, EntityHashingType.V0)
      })
    })
  })
})
