import { Item, ItemType, WearableBodyShape, WearableCategory } from './types'
import { buildZipContents, toThirdPartyContractItems } from './utils'

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
        urn: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2:collection-id1:token-id2'
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
        urn: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2:collection-id2:token-idb'
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
        urn: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2:collection-id1:token-id1'
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
