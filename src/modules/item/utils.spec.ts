import { Item, ItemMetadataType, ItemType, WearableBodyShape, WearableCategory } from './types'
import { buildItemMetadata, buildZipContents, toThirdPartyContractItems } from './utils'

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