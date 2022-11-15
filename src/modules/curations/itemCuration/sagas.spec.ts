import { call, select } from '@redux-saga/core/effects'
import { BuilderAPI } from 'lib/api/builder'
import { PaginatedResource } from 'lib/api/pagination'
import { Collection } from 'modules/collection/types'
import { fetchCollectionItemsSuccess } from 'modules/item/actions'
import { getCollection } from 'modules/collection/selectors'
import { Item } from 'modules/item/types'
import { expectSaga } from 'redux-saga-test-plan'
import { throwError } from 'redux-saga-test-plan/providers'
import { CurationStatus } from '../types'
import {
  fetchItemCurationsRequest,
  fetchItemCurationsSuccess,
  fetchItemCurationsFailure,
  fetchItemCurationSuccess,
  fetchItemCurationFailure,
  fetchItemCurationRequest
} from './actions'
import { itemCurationSaga } from './sagas'
import { ItemCuration } from './types'

const mockCollectionId = 'collectionId'
const mockItemId = 'itemId'
const mockErrorMessage = 'Some Error'

const mockBuilder = {
  fetchItemCuration: jest.fn(),
  fetchItemCurations: jest.fn()
} as any as BuilderAPI

afterEach(() => {
  jest.clearAllMocks()
})

describe('when fetching item curations', () => {
  describe('when the api request fails', () => {
    beforeEach(() => {
      ;(mockBuilder.fetchItemCurations as jest.Mock).mockRejectedValueOnce(new Error(mockErrorMessage))
    })

    it('should put the fetch item curations fail action with an error', () => {
      return expectSaga(itemCurationSaga, mockBuilder)
        .put(fetchItemCurationsFailure(mockErrorMessage))
        .dispatch(fetchItemCurationsRequest(mockCollectionId, [{ id: 'anItemId' } as Item]))
        .run({ silenceTimeout: true })
    })
  })

  describe('when the api request succeeds', () => {
    let items: Item[]
    let allItemCurations: ItemCuration[]

    beforeEach(() => {
      items = Array.from({ length: 60 }, (_, i) => ({ id: `itemId-${i}` } as Item))
      const fstChunkOfItemCurations: ItemCuration[] = Array.from({ length: 30 }, (_, i) => ({ id: `itemId-${i}` } as ItemCuration))
      const sndChunkOfItemCurations: ItemCuration[] = Array.from({ length: 30 }, (_, i) => ({ id: `itemId-${i + 30}` } as ItemCuration))
      allItemCurations = [...fstChunkOfItemCurations, ...sndChunkOfItemCurations]
      ;(mockBuilder.fetchItemCurations as jest.Mock)
        .mockResolvedValueOnce(fstChunkOfItemCurations)
        .mockResolvedValueOnce(sndChunkOfItemCurations)
    })

    it('should put the fetch item curations success action with the item curations', () => {
      return expectSaga(itemCurationSaga, mockBuilder)
        .put(fetchItemCurationsSuccess(mockCollectionId, allItemCurations))
        .dispatch(fetchItemCurationsRequest(mockCollectionId, items))
        .run({ silenceTimeout: true })
    })
  })
})

describe('when fetching the curation for an item', () => {
  describe('when the api request fails', () => {
    it('should put the fetch item curation fail action with an error', () => {
      return expectSaga(itemCurationSaga, mockBuilder)
        .provide([[call([mockBuilder, mockBuilder.fetchItemCuration], mockItemId), throwError(new Error(mockErrorMessage))]])
        .put(fetchItemCurationFailure(mockErrorMessage))
        .dispatch(fetchItemCurationRequest(mockCollectionId, mockItemId))
        .run({ silenceTimeout: true })
    })
  })

  describe('when the api request succeeds', () => {
    let itemCuration: ItemCuration
    beforeEach(() => {
      itemCuration = {
        id: 'id',
        itemId: 'itemId',
        status: CurationStatus.PENDING,
        createdAt: 0,
        updatedAt: 0,
        contentHash: 'aHash'
      }
    })
    it('should put the fetch item curations success action with the item curations', () => {
      return expectSaga(itemCurationSaga, mockBuilder)
        .provide([[call([mockBuilder, mockBuilder.fetchItemCuration], mockItemId), itemCuration]])
        .put(fetchItemCurationSuccess(mockCollectionId, itemCuration))
        .dispatch(fetchItemCurationRequest(mockCollectionId, mockItemId))
        .run({ silenceTimeout: true })
    })
  })
})

describe('when third party items were fetched', () => {
  let thirdPartyCollection: Collection
  let items: Item[]
  let paginatedData: PaginatedResource<Item>

  beforeEach(() => {
    thirdPartyCollection = {
      id: 'aCollection',
      urn: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2:tercer-fiesta-2'
    } as Collection
    paginatedData = {
      limit: 1,
      page: 1,
      pages: 1,
      results: [{ id: 'itemId1' } as Item],
      total: 1
    }
  })

  describe('and none of the items were published', () => {
    beforeEach(() => {
      items = [{ id: 'itemId1', isPublished: false } as Item, { id: 'itemId2', isPublished: false } as Item]
    })

    it('should not fetch the item curations', () => {
      return expectSaga(itemCurationSaga, mockBuilder)
        .provide([[select(getCollection, thirdPartyCollection.id), thirdPartyCollection]])
        .not.put(fetchItemCurationsRequest(thirdPartyCollection.id, items))
        .dispatch(
          fetchCollectionItemsSuccess(thirdPartyCollection.id, items, {
            limit: paginatedData.limit,
            page: paginatedData.page,
            pages: paginatedData.pages,
            total: paginatedData.total
          })
        )
        .run({ silenceTimeout: true })
    })
  })

  describe('and some of the items were published', () => {
    beforeEach(() => {
      items = [
        {
          id: 'itemId1',
          collectionId: thirdPartyCollection.id,
          urn: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2:tercer-fiesta-2',
          isPublished: false
        } as Item,
        {
          id: 'itemId2',
          collectionId: thirdPartyCollection.id,
          urn: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2:tercer-fiesta-2',
          isPublished: true
        } as Item
      ]
    })

    it('should put the success action and fetch the item curations for those items', () => {
      return expectSaga(itemCurationSaga, mockBuilder)
        .provide([[select(getCollection, thirdPartyCollection.id), thirdPartyCollection]])
        .put(fetchItemCurationsRequest(thirdPartyCollection.id, [items[1]]))
        .dispatch(
          fetchCollectionItemsSuccess(thirdPartyCollection.id, items, {
            limit: paginatedData.limit,
            page: paginatedData.page,
            pages: paginatedData.pages,
            total: paginatedData.total
          })
        )
        .run({ silenceTimeout: true })
    })
  })
})
