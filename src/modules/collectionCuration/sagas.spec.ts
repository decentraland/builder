import { call } from '@redux-saga/core/effects'
import { BuilderAPI } from 'lib/api/builder'
import { expectSaga } from 'redux-saga-test-plan'
import { throwError } from 'redux-saga-test-plan/providers'
import {
  fetchCollectionCurationFailure,
  fetchCollectionCurationRequest,
  fetchCollectionCurationsFailure,
  fetchCollectionCurationsRequest,
  fetchCollectionCurationsSuccess,
  fetchCollectionCurationSuccess,
  pushCollectionCurationFailure,
  pushCollectionCurationRequest,
  pushCollectionCurationSuccess
} from './actions'
import { curationSaga } from './sagas'

const mockCollectionId = 'collectionId'
const mockErrorMessage = 'Some Error'

const mockBuilder = ({
  fetchCurations: jest.fn(),
  fetchCuration: jest.fn(),
  pushCuration: jest.fn()
} as any) as BuilderAPI

afterEach(() => {
  jest.clearAllMocks()
})

describe('when fetching curations', () => {
  describe('when the api request fails', () => {
    it('should put the fetch curations fail action with an error', () => {
      return expectSaga(curationSaga, mockBuilder)
        .provide([[call([mockBuilder, mockBuilder.fetchCurations]), throwError(new Error(mockErrorMessage))]])
        .put(fetchCollectionCurationsFailure(mockErrorMessage))
        .dispatch(fetchCollectionCurationsRequest())
        .run({ silenceTimeout: true })
    })
  })

  describe('when the api request succeeds', () => {
    it('should put the fetch curations success action with the curations', () => {
      return expectSaga(curationSaga, mockBuilder)
        .provide([[call([mockBuilder, mockBuilder.fetchCurations]), [{}]]])
        .put(fetchCollectionCurationsSuccess([{}] as any[]))
        .dispatch(fetchCollectionCurationsRequest())
        .run({ silenceTimeout: true })
    })
  })
})

describe('when fetching a single curation', () => {
  describe('when the api request fails', () => {
    it('should put the fetch curation fail action with an error', () => {
      return expectSaga(curationSaga, mockBuilder)
        .provide([[call([mockBuilder, mockBuilder.fetchCuration], mockCollectionId), throwError(new Error(mockErrorMessage))]])
        .put(fetchCollectionCurationFailure(mockErrorMessage))
        .dispatch(fetchCollectionCurationRequest(mockCollectionId))
        .run({ silenceTimeout: true })
    })
  })

  describe('when the api request succeeds', () => {
    it('should put the fetch curation success action with the curation', () => {
      return expectSaga(curationSaga, mockBuilder)
        .provide([[call([mockBuilder, mockBuilder.fetchCuration], mockCollectionId), {}]])
        .put(fetchCollectionCurationSuccess(mockCollectionId, {} as any))
        .dispatch(fetchCollectionCurationRequest(mockCollectionId))
        .run({ silenceTimeout: true })
    })
  })
})

describe('when pushing a curation a new curation', () => {
  describe('when the api request fails', () => {
    it('should put the push curation fail action with an error', () => {
      return expectSaga(curationSaga, mockBuilder)
        .provide([[call([mockBuilder, mockBuilder.pushCuration], mockCollectionId), throwError(new Error(mockErrorMessage))]])
        .put(pushCollectionCurationFailure(mockErrorMessage))
        .dispatch(pushCollectionCurationRequest(mockCollectionId))
        .run({ silenceTimeout: true })
    })
  })

  describe('when the api request succeeds', () => {
    it('should put the push curation success and fetch curation request', () => {
      return expectSaga(curationSaga, mockBuilder)
        .provide([[call([mockBuilder, mockBuilder.pushCuration], mockCollectionId), {}]])
        .put(pushCollectionCurationSuccess())
        .put(fetchCollectionCurationRequest(mockCollectionId))
        .dispatch(pushCollectionCurationRequest(mockCollectionId))
        .run({ silenceTimeout: true })
    })
  })
})
