import { call } from '@redux-saga/core/effects'
import { BuilderAPI } from 'lib/api/builder'
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
