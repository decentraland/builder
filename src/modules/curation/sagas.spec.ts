import { call } from '@redux-saga/core/effects'
import { BuilderAPI } from 'lib/api/builder'
import { expectSaga } from 'redux-saga-test-plan'
import { throwError } from 'redux-saga-test-plan/providers'
import {
  fetchCurationFailure,
  fetchCurationRequest,
  fetchCurationsFailure,
  fetchCurationsRequest,
  fetchCurationsSuccess,
  fetchCurationSuccess,
  pushCurationFailure,
  pushCurationRequest,
  pushCurationSuccess
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
        .put(fetchCurationsFailure(mockErrorMessage))
        .dispatch(fetchCurationsRequest())
        .run({ silenceTimeout: true })
    })
  })

  describe('when the api request succeeds', () => {
    it('should put the fetch curations success action with the curations', () => {
      return expectSaga(curationSaga, mockBuilder)
        .provide([[call([mockBuilder, mockBuilder.fetchCurations]), [{}]]])
        .put(fetchCurationsSuccess([{}] as any[]))
        .dispatch(fetchCurationsRequest())
        .run({ silenceTimeout: true })
    })
  })
})

describe('when fetching a single curation', () => {
  describe('when the api request fails', () => {
    it('should put the fetch curation fail action with an error', () => {
      return expectSaga(curationSaga, mockBuilder)
        .provide([[call([mockBuilder, mockBuilder.fetchCuration], mockCollectionId), throwError(new Error(mockErrorMessage))]])
        .put(fetchCurationFailure(mockErrorMessage))
        .dispatch(fetchCurationRequest(mockCollectionId))
        .run({ silenceTimeout: true })
    })
  })

  describe('when the api request succeeds', () => {
    it('should put the fetch curation success action with the curation', () => {
      return expectSaga(curationSaga, mockBuilder)
        .provide([[call([mockBuilder, mockBuilder.fetchCuration], mockCollectionId), {}]])
        .put(fetchCurationSuccess(mockCollectionId, {} as any))
        .dispatch(fetchCurationRequest(mockCollectionId))
        .run({ silenceTimeout: true })
    })
  })
})

describe('when pushing a curation a new curation', () => {
  describe('when the api request fails', () => {
    it('should put the push curation fail action with an error', () => {
      return expectSaga(curationSaga, mockBuilder)
        .provide([[call([mockBuilder, mockBuilder.pushCuration], mockCollectionId), throwError(new Error(mockErrorMessage))]])
        .put(pushCurationFailure(mockErrorMessage))
        .dispatch(pushCurationRequest(mockCollectionId))
        .run({ silenceTimeout: true })
    })
  })

  describe('when the api request succeeds', () => {
    it('should put the push curation success and fetch curation request', () => {
      return expectSaga(curationSaga, mockBuilder)
        .provide([[call([mockBuilder, mockBuilder.pushCuration], mockCollectionId), {}]])
        .put(pushCurationSuccess())
        .put(fetchCurationRequest(mockCollectionId))
        .dispatch(pushCurationRequest(mockCollectionId))
        .run({ silenceTimeout: true })
    })
  })
})
