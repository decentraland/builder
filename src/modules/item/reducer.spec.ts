import { ChainId } from '@dcl/schemas'
import { saveCollectionSuccess } from 'modules/collection/actions'
import { Collection } from 'modules/collection/types'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import {
  clearStateSaveMultipleItems,
  downloadItemFailure,
  downloadItemRequest,
  downloadItemSuccess,
  saveMultipleItemsCancelled,
  saveMultipleItemsSuccess,
  saveMultipleItemsFailure
} from './actions'
import { INITIAL_STATE, itemReducer, ItemState } from './reducer'
import { Item } from './types'

jest.mock('decentraland-dapps/dist/lib/eth')
const getChainIdByNetworkMock: jest.Mock<typeof getChainIdByNetwork> = (getChainIdByNetwork as unknown) as jest.Mock<
  typeof getChainIdByNetwork
>

let state: ItemState
let items: Item[]
let itemsMap: Record<string, Item>
let fileNames: string[]
const error = 'someError'

beforeEach(() => {
  state = { ...INITIAL_STATE }
  items = [{ id: 'anItemId' } as Item, { id: 'anotherItemId' } as Item]
  itemsMap = {
    [items[0].id]: items[0],
    [items[1].id]: items[1]
  }
  fileNames = ['file1', 'file2']
})

describe('when reducing the save collection success action', () => {
  let fstItem: Item
  let sndItem: Item
  let thirdItem: Item
  let fstCollection: Collection
  let sndCollection: Collection
  let result: ItemState

  beforeEach(() => {
    fstItem = {
      id: 'fst-item',
      urn: 'urn:decentraland:ropsten:collections-v2:0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8:fst-token-id',
      collectionId: 'fst-collection-id'
    } as Item
    sndItem = {
      id: 'snd-item',
      urn: 'urn:decentraland:ropsten:collections-v2:0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8:snd-token-id',
      collectionId: 'fst-collection-id'
    } as Item
    thirdItem = {
      id: 'third-item',
      urn: 'urn:decentraland:matic:collections-thirdparty:tp-id:tp-collection-id:tp-token-id',
      collectionId: 'snd-collection-id'
    } as Item

    state.data = {
      [fstItem.id]: fstItem,
      [sndItem.id]: sndItem,
      [thirdItem.id]: thirdItem
    }
    fstCollection = {
      id: 'fst-collection-id',
      urn: 'urn:decentraland:ropsten:collections-v2:0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8'
    } as Collection
    sndCollection = {
      id: 'snd-collection-id',
      urn: 'urn:decentraland:matic:collections-thirdparty:tp-id:tp-collection-id'
    } as Collection
  })

  describe('and the collection is a third party collection', () => {
    let newCollectionAddress: string

    beforeEach(() => {
      newCollectionAddress = '0x00192Fb10dF37c9FB26829eb2CC623cd1BF599E8'
      fstCollection = { ...fstCollection, urn: `urn:decentraland:ropsten:collections-v2:${newCollectionAddress}` } as Collection
      getChainIdByNetworkMock.mockReturnValueOnce(ChainId.ETHEREUM_ROPSTEN as any).mockReturnValueOnce(ChainId.ETHEREUM_ROPSTEN as any)
      result = itemReducer(state, saveCollectionSuccess(fstCollection))
    })

    it("should update the collection items's URN according to the collection URN and not update the other items", () => {
      expect(result).toEqual({
        ...state,
        data: {
          ...state.data,
          [fstItem.id]: {
            ...fstItem,
            urn: `urn:decentraland:ropsten:collections-v2:${newCollectionAddress}:fst-token-id`
          },
          [sndItem.id]: {
            ...sndItem,
            urn: `urn:decentraland:ropsten:collections-v2:${newCollectionAddress}:snd-token-id`
          }
        }
      })
    })
  })

  describe('and the collection is a decentraland collection', () => {
    let newThirdPartyCollectionId: string

    beforeEach(() => {
      newThirdPartyCollectionId = 'another-tp-collection-id'
      sndCollection = {
        ...sndCollection,
        urn: `urn:decentraland:matic:collections-thirdparty:tp-id:${newThirdPartyCollectionId}`
      } as Collection
      getChainIdByNetworkMock.mockReturnValueOnce(ChainId.MATIC_MAINNET as any)
      result = itemReducer(state, saveCollectionSuccess(sndCollection))
    })

    it("should update the collection items's URN according to the collection URN and not update the other items", () => {
      expect(result).toEqual({
        ...state,
        data: {
          ...state.data,
          [thirdItem.id]: {
            ...thirdItem,
            urn: `urn:decentraland:matic:collections-thirdparty:tp-id:${newThirdPartyCollectionId}:tp-token-id`
          }
        }
      })
    })
  })
})

describe('when an action of type DOWNLOAD_ITEM_REQUEST is called', () => {
  const itemId = 'anItem'
  it('should add a downloadItemRequest to the loading array', () => {
    expect(itemReducer(INITIAL_STATE, downloadItemRequest(itemId))).toStrictEqual({
      ...INITIAL_STATE,
      loading: [downloadItemRequest(itemId)]
    })
  })
})

describe('when an action of type DOWNLOAD_ITEM_SUCCESS is called', () => {
  const itemId = 'anItem'
  const error = 'something went wrong'
  it('should remove a downloadItemRequest from the loading array and null the error', () => {
    expect(
      itemReducer(
        {
          ...INITIAL_STATE,
          loading: [downloadItemRequest(itemId)],
          error
        },
        downloadItemSuccess(itemId)
      )
    ).toStrictEqual({
      ...INITIAL_STATE,
      loading: [],
      error: null
    })
  })
})

describe('when an action of type DOWNLOAD_ITEM_FAILURE is called', () => {
  const itemId = 'anItem'
  const error = 'something went wrong'
  it('should remove a downloadItemRequest from the loading array and set the error', () => {
    expect(
      itemReducer(
        {
          ...INITIAL_STATE,
          loading: [downloadItemRequest(itemId)]
        },
        downloadItemFailure(itemId, error)
      )
    ).toStrictEqual({
      ...INITIAL_STATE,
      loading: [],
      error
    })
  })
})

describe('when reducing the successful save multiple items action', () => {
  it('should return a state with the saved items', () => {
    expect(itemReducer(state, saveMultipleItemsSuccess(items, fileNames))).toEqual({
      ...INITIAL_STATE,
      data: { ...state.data, ...itemsMap }
    })
  })
})

describe('when reducing the failing save multiple items action', () => {
  it('should return a state with the saved items added and the error set', () => {
    expect(itemReducer(state, saveMultipleItemsFailure(error, items, fileNames))).toEqual({
      ...INITIAL_STATE,
      error,
      data: {
        ...state.data,
        ...itemsMap
      }
    })
  })
})

describe('when reducing the save cancelling save multiple items action', () => {
  it('should return a state with the saved items added', () => {
    expect(itemReducer(state, saveMultipleItemsCancelled(items, fileNames))).toEqual({
      ...INITIAL_STATE,
      data: {
        ...state.data,
        ...itemsMap
      }
    })
  })
})

describe('when reducing the clearing save multiple items action', () => {
  beforeEach(() => {
    state = {
      ...state,
      error
    }
  })

  it('should return a state with the error cleared', () => {
    expect(itemReducer(state, clearStateSaveMultipleItems())).toEqual({
      ...state,
      error: null
    })
  })
})
