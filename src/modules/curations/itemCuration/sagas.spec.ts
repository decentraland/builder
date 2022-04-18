import { call } from '@redux-saga/core/effects'
import { BuilderAPI } from 'lib/api/builder'
import { fetchCollectionSuccess } from 'modules/collection/actions'
import { Collection } from 'modules/collection/types'
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

const mockBuilder = ({
  fetchItemCuration: jest.fn(),
  fetchItemCurations: jest.fn()
} as any) as BuilderAPI

afterEach(() => {
  jest.clearAllMocks()
})

describe('when fetching item curations', () => {
  describe('when the api request fails', () => {
    it('should put the fetch item curations fail action with an error', () => {
      return expectSaga(itemCurationSaga, mockBuilder)
        .provide([[call([mockBuilder, mockBuilder.fetchItemCurations], mockCollectionId), throwError(new Error(mockErrorMessage))]])
        .put(fetchItemCurationsFailure(mockErrorMessage))
        .dispatch(fetchItemCurationsRequest(mockCollectionId))
        .run({ silenceTimeout: true })
    })
  })

  describe('when the api request succeeds', () => {
    it('should put the fetch item curations success action with the item curations', () => {
      return expectSaga(itemCurationSaga, mockBuilder)
        .provide([[call([mockBuilder, mockBuilder.fetchItemCurations], mockCollectionId), [{}]]])
        .put(fetchItemCurationsSuccess(mockCollectionId, [{}] as any[]))
        .dispatch(fetchItemCurationsRequest(mockCollectionId))
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

describe('when a third party collection is fetched', () => {
  let thirdPartyCollection: Collection

  beforeEach(() => {
    thirdPartyCollection = {
      id: 'aCollection',
      urn: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2:tercer-fiesta-2'
    } as Collection
  })

  it('should put the success action and fetch the item curations for the collection', () => {
    return expectSaga(itemCurationSaga, mockBuilder)
      .put(fetchItemCurationsRequest(thirdPartyCollection.id))
      .dispatch(fetchCollectionSuccess(thirdPartyCollection.id, thirdPartyCollection))
      .run({ silenceTimeout: true })
  })
})
