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
  hasVideo,
  isEmote,
  getRepresentationMainFile,
  isMaskFile,
  isExpressionsFile,
  isExpressionsMaskFile,
  getRequiredCounterpartFile,
  hasFacialExpressions,
  findOrphanedAuxiliaryFiles,
  isModelPath,
  stripWrappingFolder
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

describe('when checking if an item is of a wearable type', () => {
  let item: Item<ItemType.EMOTE | ItemType.WEARABLE>

  beforeEach(() => {
    item = {
      type: ItemType.WEARABLE,
      name: 'first-name',
      contents: {}
    } as Item<ItemType.EMOTE | ItemType.WEARABLE>
  })

  describe('and the item is of a wearable type', () => {
    beforeEach(() => {
      item = {
        ...item,
        type: ItemType.WEARABLE
      }
    })

    it('should return true', () => {
      expect(isEmote(item)).toBe(false)
    })
  })

  describe('and the item is of a emote type', () => {
    beforeEach(() => {
      item = {
        ...item,
        type: ItemType.EMOTE
      }
    })

    it('should return false', () => {
      expect(isEmote(item)).toBe(true)
    })
  })
})

describe('when checking if an item is of emote type', () => {
  let item: Item<ItemType.EMOTE | ItemType.WEARABLE>

  beforeEach(() => {
    item = {
      type: ItemType.EMOTE,
      name: 'first-name',
      contents: {}
    } as Item<ItemType.EMOTE | ItemType.WEARABLE>
  })

  describe('and the item is of a emote type', () => {
    beforeEach(() => {
      item = {
        ...item,
        type: ItemType.EMOTE
      }
    })

    it('should return true', () => {
      expect(isEmote(item)).toBe(true)
    })
  })

  describe('and the item is of a wearable type', () => {
    beforeEach(() => {
      item = {
        ...item,
        type: ItemType.WEARABLE
      }
    })

    it('should return false', () => {
      expect(isEmote(item)).toBe(false)
    })
  })
})

describe('when getting the representation main file for a body shape', () => {
  let item: Item

  beforeEach(() => {
    item = {
      type: ItemType.WEARABLE,
      data: {
        representations: [
          {
            bodyShapes: [BodyShape.MALE],
            mainFile: 'male.glb',
            contents: ['male.glb'],
            overrideReplaces: [],
            overrideHides: []
          },
          {
            bodyShapes: [BodyShape.FEMALE],
            mainFile: 'female.glb',
            contents: ['female.glb'],
            overrideReplaces: [],
            overrideHides: []
          }
        ]
      }
    } as unknown as Item
  })

  describe('and the body shape has a matching representation', () => {
    it('should return the mainFile for the matching body shape', () => {
      expect(getRepresentationMainFile(item, BodyShape.FEMALE)).toBe('female.glb')
    })
  })

  describe('and the body shape does not have a matching representation', () => {
    it('should fall back to the first representation mainFile', () => {
      item.data.representations = [
        {
          bodyShapes: [BodyShape.MALE],
          mainFile: 'male.glb',
          contents: ['male.glb'],
          overrideReplaces: [],
          overrideHides: []
        } as WearableRepresentation
      ]
      expect(getRepresentationMainFile(item, BodyShape.FEMALE)).toBe('male.glb')
    })
  })

  describe('and the item has no representations', () => {
    it('should return null', () => {
      item.data.representations = []
      expect(getRepresentationMainFile(item, BodyShape.MALE)).toBeNull()
    })
  })
})

describe('when checking if a file is a mask file', () => {
  describe('and the file ends with _mask.png', () => {
    it('should return true', () => {
      expect(isMaskFile('red_eyes_mask.png')).toBe(true)
    })
  })

  describe('and the file ends with _expressions_mask.png', () => {
    it('should return false because it is an expressions mask, not a plain mask', () => {
      expect(isMaskFile('red_eyes_expressions_mask.png')).toBe(false)
    })
  })

  describe('and the file is a plain image', () => {
    it('should return false', () => {
      expect(isMaskFile('red_eyes.png')).toBe(false)
    })
  })

  describe('and the file is uppercased', () => {
    it('should return true since the match is case-insensitive', () => {
      expect(isMaskFile('RED_EYES_MASK.PNG')).toBe(true)
    })
  })
})

describe('when checking if a file is an expressions file', () => {
  describe('and the file ends with _expressions.png', () => {
    it('should return true', () => {
      expect(isExpressionsFile('red_eyes_expressions.png')).toBe(true)
    })
  })

  describe('and the file ends with _expressions_mask.png', () => {
    it('should return false because it is the expressions mask, not the expressions image', () => {
      expect(isExpressionsFile('red_eyes_expressions_mask.png')).toBe(false)
    })
  })

  describe('and the file is a plain image', () => {
    it('should return false', () => {
      expect(isExpressionsFile('red_eyes.png')).toBe(false)
    })
  })
})

describe('when checking if a file is an expressions mask file', () => {
  describe('and the file ends with _expressions_mask.png', () => {
    it('should return true', () => {
      expect(isExpressionsMaskFile('red_eyes_expressions_mask.png')).toBe(true)
    })
  })

  describe('and the file ends with only _mask.png', () => {
    it('should return false', () => {
      expect(isExpressionsMaskFile('red_eyes_mask.png')).toBe(false)
    })
  })
})

describe('when getting the required counterpart for an auxiliary file', () => {
  describe('and the file is a mask', () => {
    it('should return the base PNG path', () => {
      expect(getRequiredCounterpartFile('male/red_eyes_mask.png')).toBe('male/red_eyes.png')
    })
  })

  describe('and the file is an expressions image', () => {
    it('should return the base PNG path', () => {
      expect(getRequiredCounterpartFile('female/red_eyes_expressions.png')).toBe('female/red_eyes.png')
    })
  })

  describe('and the file is an expressions mask', () => {
    it('should return the expressions PNG path', () => {
      expect(getRequiredCounterpartFile('male/red_eyes_expressions_mask.png')).toBe('male/red_eyes_expressions.png')
    })
  })

  describe('and the file is a base PNG with no auxiliary suffix', () => {
    it('should return null', () => {
      expect(getRequiredCounterpartFile('red_eyes.png')).toBeNull()
    })
  })
})

describe('when checking if contents include facial expressions', () => {
  describe('and the contents map has an _expressions.png file', () => {
    it('should return true', () => {
      expect(
        hasFacialExpressions({
          'red_eyes.png': 'hash1',
          'red_eyes_expressions.png': 'hash2'
        })
      ).toBe(true)
    })
  })

  describe('and the contents map only has a base PNG and a mask', () => {
    it('should return false', () => {
      expect(
        hasFacialExpressions({
          'red_eyes.png': 'hash1',
          'red_eyes_mask.png': 'hash2'
        })
      ).toBe(false)
    })
  })

  describe('and the contents map only has the expressions mask without the expressions image', () => {
    it('should return false because the marker is the _expressions.png file itself', () => {
      expect(
        hasFacialExpressions({
          'red_eyes.png': 'hash1',
          'red_eyes_expressions_mask.png': 'hash2'
        })
      ).toBe(false)
    })
  })

  describe('and the contents map is empty or undefined', () => {
    it('should return false for undefined', () => {
      expect(hasFacialExpressions(undefined)).toBe(false)
    })

    it('should return false for an empty record', () => {
      expect(hasFacialExpressions({})).toBe(false)
    })
  })
})

describe('when scanning for orphaned auxiliary files', () => {
  describe('and a _mask file has no base PNG counterpart', () => {
    it('should return a list with the orphan and its expected base PNG', () => {
      expect(
        findOrphanedAuxiliaryFiles({
          'red_eyes_mask.png': 'hash1'
        })
      ).toEqual([{ orphan: 'red_eyes_mask.png', expected: 'red_eyes.png' }])
    })
  })

  describe('and an _expressions file has no base PNG counterpart', () => {
    it('should return a list with the orphan and its expected base PNG', () => {
      expect(
        findOrphanedAuxiliaryFiles({
          'red_eyes_expressions.png': 'hash1'
        })
      ).toEqual([{ orphan: 'red_eyes_expressions.png', expected: 'red_eyes.png' }])
    })
  })

  describe('and an _expressions_mask file has no _expressions sibling', () => {
    it('should return a list with the orphan and its expected _expressions PNG', () => {
      expect(
        findOrphanedAuxiliaryFiles({
          'red_eyes.png': 'hash1',
          'red_eyes_expressions_mask.png': 'hash2'
        })
      ).toEqual([{ orphan: 'red_eyes_expressions_mask.png', expected: 'red_eyes_expressions.png' }])
    })
  })

  describe('and several auxiliary files are missing different counterparts', () => {
    it('should return one entry for each orphan in the order they appear in contents', () => {
      expect(
        findOrphanedAuxiliaryFiles({
          'red_eyes_mask.png': 'h1',
          'red_eyes_expressions.png': 'h2'
        })
      ).toEqual([
        { orphan: 'red_eyes_mask.png', expected: 'red_eyes.png' },
        { orphan: 'red_eyes_expressions.png', expected: 'red_eyes.png' }
      ])
    })
  })

  describe('and the counterpart exists with a different file-extension casing', () => {
    it('should treat it as present so no orphan is reported', () => {
      expect(
        findOrphanedAuxiliaryFiles({
          'red_eyes.PNG': 'h1',
          'red_eyes_mask.png': 'h2'
        })
      ).toEqual([])
    })
  })

  describe('and every auxiliary file has its counterpart', () => {
    it('should return an empty array', () => {
      expect(
        findOrphanedAuxiliaryFiles({
          'red_eyes.png': 'h1',
          'red_eyes_mask.png': 'h2',
          'red_eyes_expressions.png': 'h3',
          'red_eyes_expressions_mask.png': 'h4'
        })
      ).toEqual([])
    })
  })

  describe('and contents is undefined', () => {
    it('should return an empty array', () => {
      expect(findOrphanedAuxiliaryFiles(undefined)).toEqual([])
    })
  })

  describe('and contents contains only the base PNG', () => {
    it('should return an empty array', () => {
      expect(findOrphanedAuxiliaryFiles({ 'red_eyes.png': 'h1' })).toEqual([])
    })
  })
})

describe('when checking whether a file is the main model path', () => {
  describe('and the file is a base image PNG', () => {
    it('should return true', () => {
      expect(isModelPath('red_eyes.png')).toBe(true)
    })
  })

  describe('and the file is a _mask.png auxiliary', () => {
    it('should return false', () => {
      expect(isModelPath('red_eyes_mask.png')).toBe(false)
    })
  })

  describe('and the file is an _expressions.png auxiliary', () => {
    it('should return false so that detection still resolves to the base PNG', () => {
      expect(isModelPath('red_eyes_expressions.png')).toBe(false)
    })
  })

  describe('and the file is an _expressions_mask.png auxiliary', () => {
    it('should return false', () => {
      expect(isModelPath('red_eyes_expressions_mask.png')).toBe(false)
    })
  })

  describe('and the file is a GLB model', () => {
    it('should return true', () => {
      expect(isModelPath('model.glb')).toBe(true)
    })
  })
})

describe('when stripping a wrapping folder from a zip content map', () => {
  let blob: Blob

  beforeEach(() => {
    blob = new Blob([new Uint8Array([0])])
  })

  describe('and every file sits under a single non-body-shape directory', () => {
    it('should strip that directory from every key', () => {
      const result = stripWrappingFolder({
        'F_Mouth_00/F_Mouth_00.png': blob,
        'F_Mouth_00/F_Mouth_00_expressions.png': blob
      })
      expect(Object.keys(result).sort()).toEqual(['F_Mouth_00.png', 'F_Mouth_00_expressions.png'])
    })
  })

  describe('and the content is already at the root level', () => {
    it('should return the same content unchanged', () => {
      const input = { 'red_eyes.png': blob, 'red_eyes_mask.png': blob }
      expect(stripWrappingFolder(input)).toEqual(input)
    })
  })

  describe('and the single top-level directory is a body-shape folder', () => {
    it('should not strip male/', () => {
      const input = { 'male/red_eyes.png': blob }
      expect(stripWrappingFolder(input)).toEqual(input)
    })

    it('should not strip female/', () => {
      const input = { 'female/red_eyes.png': blob }
      expect(stripWrappingFolder(input)).toEqual(input)
    })
  })

  describe('and the wrapper contains body-shape folders inside it', () => {
    it('should strip the wrapper once and keep the body-shape folders intact', () => {
      const result = stripWrappingFolder({
        'F_Mouth_00/male/red_eyes.png': blob,
        'F_Mouth_00/female/red_eyes.png': blob
      })
      expect(Object.keys(result).sort()).toEqual(['female/red_eyes.png', 'male/red_eyes.png'])
    })
  })

  describe('and there are multiple top-level entries', () => {
    it('should not strip when there is a file at the root alongside a folder', () => {
      const input = {
        'thumbnail.png': blob,
        'F_Mouth_00/F_Mouth_00.png': blob
      }
      expect(stripWrappingFolder(input)).toEqual(input)
    })

    it('should not strip when there are two distinct top-level folders', () => {
      const input = {
        'wrapper_a/foo.png': blob,
        'wrapper_b/bar.png': blob
      }
      expect(stripWrappingFolder(input)).toEqual(input)
    })
  })

  describe('and the wrapper is nested multiple levels deep', () => {
    it('should recursively strip every wrapper until a body-shape folder or root file is reached', () => {
      const result = stripWrappingFolder({
        'outer/inner/red_eyes.png': blob,
        'outer/inner/red_eyes_mask.png': blob
      })
      expect(Object.keys(result).sort()).toEqual(['red_eyes.png', 'red_eyes_mask.png'])
    })
  })

  describe('and the zip contains explicit folder markers (size-0 entries)', () => {
    it('should ignore them when detecting the wrapper and drop them from the output', () => {
      const emptyBlob = new Blob([])
      const result = stripWrappingFolder({
        'F_Mouth_00/': emptyBlob,
        'F_Mouth_00/F_Mouth_00.png': blob
      })
      expect(Object.keys(result)).toEqual(['F_Mouth_00.png'])
    })
  })

  describe('and the content map is empty', () => {
    it('should return an empty record', () => {
      expect(stripWrappingFolder({})).toEqual({})
    })
  })
})
