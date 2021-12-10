import { Item, ItemMetadataType, ItemType, WearableBodyShape, WearableCategory, WearableRepresentation } from './types'
import { buildItemMetadata, buildZipContents, toThirdPartyContractItems, areEqualArrays, areEqualRepresentations } from './utils'

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
    expect(areEqualArrays(['a', 'b', 'c', 'd'], ['c', 'a', 'b', 'd'])).toBe(true)
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
