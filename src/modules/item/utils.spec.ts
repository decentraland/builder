import { BodyShape, WearableCategory } from '@dcl/schemas'
import { Item, ItemMetadataType, ItemType, VIDEO_PATH, WearableRepresentation } from './types'
import {
  buildItemMetadata,
  buildZipContents,
  toThirdPartyContractItems,
  areEqualArrays,
  areEqualRepresentations,
  groupsOf,
  getWearableCategories,
  isSmart,
  getFirstWearableOrItem,
  formatExtensions,
  hasVideo
} from './utils'

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
          representations: [{ bodyShapes: [BodyShape.MALE] }]
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
          representations: [{ bodyShapes: [BodyShape.MALE, BodyShape.FEMALE] }]
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
          representations: [{ bodyShapes: [BodyShape.FEMALE] }]
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
    bodyShapes: [BodyShape.MALE],
    contents: ['male.glb'],
    mainFile: 'male.glb',
    overrideHides: [],
    overrideReplaces: []
  }

  const female: WearableRepresentation = {
    bodyShapes: [BodyShape.FEMALE],
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

describe('when getting wearable categories', () => {
  describe('when a model file name is provided in contents', () => {
    it('should return all categories inluding non model', () => {
      const categories = getWearableCategories({
        'model.glb': {}
      })

      expect(categories).toEqual([
        'facial_hair',
        'hair',
        'upper_body',
        'lower_body',
        'feet',
        'earring',
        'eyewear',
        'hat',
        'helmet',
        'mask',
        'tiara',
        'top_head',
        'skin',
        'hands_wear'
      ])
    })
  })

  describe('when a model file name is not provided in contents', () => {
    it('should return non model categories', () => {
      const categories = getWearableCategories({
        'image.png': {}
      })

      expect(categories).toEqual(['eyebrows', 'eyes', 'mouth'])
    })
  })
})

describe('when checking if an item is smart', () => {
  describe('when the type is undefined', () => {
    it('should return false', () => {
      const item = {} as Item
      expect(isSmart(item)).toBe(false)
    })
  })

  describe('when the item does not have content', () => {
    it('should return false', () => {
      const item = { type: ItemType.WEARABLE } as Item
      expect(isSmart(item)).toBe(false)
    })
  })

  describe('when the item does not have a content file that suggest the wearable is smart', () => {
    it('should return false', () => {
      const item = { type: ItemType.WEARABLE, contents: { file1: new Blob(), file2: new Blob() } } as unknown as Item
      expect(isSmart(item)).toBe(false)
    })
  })

  describe('when the item is an emote', () => {
    it('should return false', () => {
      const item = { type: ItemType.EMOTE } as Item
      expect(isSmart(item)).toBe(false)
    })
  })

  describe('when the item is a wearable and has a content file with a javascript extension', () => {
    it('should return true', () => {
      const item = { type: ItemType.WEARABLE, contents: { 'sw.js': '' } } as unknown as Item
      expect(isSmart(item)).toBe(true)
    })
  })
})

describe('when getting the first wearable or item of an array', () => {
  describe('when the array is empty', () => {
    it('should return undefined', () => {
      expect(getFirstWearableOrItem([])).toBeUndefined()
    })
  })

  describe('when the array has a wearable', () => {
    it('should return the wearable', () => {
      const wearable = { type: ItemType.WEARABLE } as Item
      expect(getFirstWearableOrItem([wearable])).toBe(wearable)
    })
  })

  describe('when the array has an item', () => {
    it('should return the item', () => {
      const item = { type: ItemType.EMOTE } as Item
      expect(getFirstWearableOrItem([item])).toBe(item)
    })
  })

  describe('when the array has a wearable and an item', () => {
    it('should return the wearable', () => {
      const wearable = { type: ItemType.WEARABLE } as Item
      const item = { type: ItemType.EMOTE } as Item
      expect(getFirstWearableOrItem([item, wearable])).toBe(wearable)
    })
  })
})

describe('when formatting accepted extensions', () => {
  describe('when the array is empty', () => {
    it('should return an empty string', () => {
      expect(formatExtensions([])).toBe('')
    })
  })

  describe('when the array has one extension', () => {
    it('should return the extension', () => {
      expect(formatExtensions(['.jpg'])).toBe('JPG')
    })
  })

  describe('when the array has multiple extensions', () => {
    it('should return the extensions sorted and separated by commas', () => {
      expect(formatExtensions(['.zip', '.glb', '.gltf'])).toBe('GLB, GLTF or ZIP')
    })
  })
})

describe('when getting if the item has a video', () => {
  let item: Item

  beforeEach(() => {
    item = {
      name: 'first-name',
      contents: {}
    } as Item
  })

  describe('and the item does not have the video in its contents', () => {
    describe('and the function receives an empty src in the parameters', () => {
      it('should return false', () => {
        expect(hasVideo(item, '')).toBe(false)
      })
    })

    describe('and the function receives an non-empty src in the parameters', () => {
      it('should return false', () => {
        expect(hasVideo(item, '/video/src.mp4')).toBe(true)
      })
    })
  })

  describe('and the item has the video in its contents', () => {
    beforeEach(() => {
      item = {
        ...item,
        contents: {
          [VIDEO_PATH]: 'the-video'
        },
        video: VIDEO_PATH
      } as Item
    })

    describe('and the function receives an empty src in the parameters', () => {
      it('should return true', () => {
        expect(hasVideo(item, '')).toBe(true)
      })
    })

    describe('and the function receives a non-empty src in the parameters', () => {
      it('should return true', () => {
        expect(hasVideo(item, 'the-video')).toBe(true)
      })
    })
  })
})
