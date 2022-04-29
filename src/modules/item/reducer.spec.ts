import { ChainId } from '@dcl/schemas'
import { saveCollectionSuccess } from 'modules/collection/actions'
import { Collection } from 'modules/collection/types'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import {
  clearSaveMultipleItems,
  downloadItemFailure,
  downloadItemRequest,
  downloadItemSuccess,
  saveMultipleItemsCancelled,
  saveMultipleItemsSuccess,
  rescueItemsChunkSuccess,
  rescueItemsRequest,
  rescueItemsSuccess,
  fetchCollectionItemsSuccess
} from './actions'
import { INITIAL_STATE, itemReducer, ItemState } from './reducer'
import { Item } from './types'
import { PaginatedResource } from 'lib/api/pagination'
import { toItemObject } from './utils'

jest.mock('decentraland-dapps/dist/lib/eth')
const getChainIdByNetworkMock: jest.Mock<typeof getChainIdByNetwork> = (getChainIdByNetwork as unknown) as jest.Mock<
  typeof getChainIdByNetwork
>

const error = 'something went wrong'
let state: ItemState
let items: Item[]
let itemsMap: Record<string, Item>
let fileNames: string[]

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
    expect(itemReducer(state, saveMultipleItemsSuccess(items, fileNames, []))).toEqual({
      ...INITIAL_STATE,
      data: { ...state.data, ...itemsMap }
    })
  })
})

describe('when reducing the save cancelling save multiple items action', () => {
  it('should return a state with the saved items added', () => {
    expect(itemReducer(state, saveMultipleItemsCancelled(items, [], [], fileNames))).toEqual({
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
    expect(itemReducer(state, clearSaveMultipleItems())).toEqual({
      ...state,
      error: null
    })
  })
})

describe('when reducing an action of a successful rescue items', () => {
  let collection: Collection
  let items: Item[]
  let contentHashes: string[]

  beforeEach(() => {
    collection = { id: 'some-id' } as Collection
    items = [{ id: 'some-id' } as Item]
    contentHashes = ['some-hash']

    state = {
      ...state,
      loading: [rescueItemsRequest(collection, items, contentHashes)],
      error
    }
  })
  it('should remove the rescue items request action from the loading array and null the error', () => {
    expect(itemReducer(state, rescueItemsSuccess(collection, items, contentHashes, ChainId.MATIC_MUMBAI, ['hashes']))).toEqual({
      ...state,
      loading: [],
      error: null
    })
  })
})

describe('when reducing an action of a successful chunk of rescued items', () => {
  let collection: Collection
  let items: Item[]
  let contentHashes: string[]

  beforeEach(() => {
    collection = { id: 'some-id' } as Collection
    items = [{ id: 'some-id' } as Item]
    contentHashes = ['some-hash']

    state = {
      ...state,
      data: {
        anItemId: {
          id: 'anItemId'
        } as Item
      }
    }
  })

  it('should add the items to the state', () => {
    expect(itemReducer(state, rescueItemsChunkSuccess(collection, items, contentHashes, ChainId.MATIC_MUMBAI, 'hash'))).toEqual({
      ...state,
      data: {
        ...state.data,
        [items[0].id]: items[0]
      }
    })
  })
})

describe('when reducing an action of a successful fetch of collection items', () => {
  let collection: Collection
  let items: Item[]
  let paginationData: PaginatedResource<Item>

  beforeEach(() => {
    collection = { id: 'some-id' } as Collection
    items = [{ id: 'some-id' } as Item]
    paginationData = {
      limit: 1,
      page: 1,
      pages: 1,
      total: 1,
      results: items
    }

    state = {
      ...state,
      data: {
        anItemId: {
          id: 'anItemId'
        } as Item
      },
      pagination: {
        anAddress: {
          ids: ['anItemId'],
          total: 1,
          currentPage: 1,
          limit: 1,
          totalPages: 1
        }
      }
    }
  })

  describe('and fetching only one page', () => {
    it('should add the items to the state and update the pagination data', () => {
      expect(itemReducer(state, fetchCollectionItemsSuccess(collection.id, items, paginationData))).toEqual({
        ...state,
        data: {
          ...state.data,
          ...toItemObject(items)
        },
        pagination: {
          ...state.pagination,
          [collection.id]: {
            ids: items.map(item => item.id),
            total: paginationData.total,
            currentPage: paginationData.page,
            limit: paginationData.limit,
            totalPages: paginationData.pages
          }
        }
      })
    })
  })
  describe('and fetching several pages at the same time', () => {
    it('should add the items to the state with the new items', () => {
      expect(itemReducer(state, fetchCollectionItemsSuccess(collection.id, items, undefined))).toEqual({
        ...state,
        data: {
          ...state.data,
          ...toItemObject(items)
        }
      })
    })
  })
})
