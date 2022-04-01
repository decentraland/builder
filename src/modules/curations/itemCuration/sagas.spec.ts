import { call, select } from '@redux-saga/core/effects'
import { BuilderAPI, PaginatedResource } from 'lib/api/builder'
import { Collection } from 'modules/collection/types'
import { fetchCollectionItemsSuccess } from 'modules/item/actions'
import { getCollection } from 'modules/collection/selectors'
import { Item } from 'modules/item/types'
import { expectSaga } from 'redux-saga-test-plan'
import { throwError } from 'redux-saga-test-plan/providers'
import { fetchItemCurationsRequest, fetchItemCurationsSuccess, fetchItemCurationsFailure } from './actions'
import { itemCurationSaga } from './sagas'

const mockCollectionId = 'collectionId'
const mockErrorMessage = 'Some Error'

const mockBuilder = ({
  fetchItemCurations: jest.fn()
} as any) as BuilderAPI

afterEach(() => {
  jest.clearAllMocks()
})

describe('when fetching item curations', () => {
  describe('when the api request fails', () => {
    it('should put the fetch item curations fail action with an error', () => {
      return expectSaga(itemCurationSaga, mockBuilder)
        .provide([[call([mockBuilder, mockBuilder.fetchItemCurations], mockCollectionId, []), throwError(new Error(mockErrorMessage))]])
        .put(fetchItemCurationsFailure(mockErrorMessage))
        .dispatch(fetchItemCurationsRequest(mockCollectionId, []))
        .run({ silenceTimeout: true })
    })
  })

  describe('when the api request succeeds', () => {
    it('should put the fetch item curations success action with the item curations', () => {
      return expectSaga(itemCurationSaga, mockBuilder)
        .provide([[call([mockBuilder, mockBuilder.fetchItemCurations], mockCollectionId, []), [{}]]])
        .put(fetchItemCurationsSuccess(mockCollectionId, [{}] as any[]))
        .dispatch(fetchItemCurationsRequest(mockCollectionId, []))
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
    items = [{ id: 'itemId1' } as Item, { id: 'itemId2' } as Item]
  })

  it('should put the success action and fetch the item curations for those items', () => {
    return expectSaga(itemCurationSaga, mockBuilder)
      .provide([[select(getCollection, thirdPartyCollection.id), thirdPartyCollection]])
      .put(fetchItemCurationsRequest(thirdPartyCollection.id, items))
      .dispatch(fetchCollectionItemsSuccess(thirdPartyCollection.id, items, paginatedData))
      .run({ silenceTimeout: true })
  })
})
