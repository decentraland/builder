import { call } from '@redux-saga/core/effects'
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

describe('when fetching curations', () => {
  describe('when the api request fails', () => {
    it('should put the fetch curations fail action with an error', () => {
      const builder = { fetchCurations: jest.fn() } as any
      return expectSaga(curationSaga, builder)
        .provide([[call([builder, builder.fetchCurations]), throwError(new Error(mockErrorMessage))]])
        .put(fetchCurationsFailure(mockErrorMessage))
        .dispatch(fetchCurationsRequest())
        .run({ silenceTimeout: true })
    })
  })

  describe('when the api request succeeds', () => {
    it('should put the fetch curations success action with the curations', () => {
      const builder = { fetchCurations: jest.fn() } as any
      return expectSaga(curationSaga, builder)
        .provide([[call([builder, builder.fetchCurations]), [{}]]])
        .put(fetchCurationsSuccess([{}] as any[]))
        .dispatch(fetchCurationsRequest())
        .run({ silenceTimeout: true })
    })
  })
})

describe('when fetching a single curation', () => {
  describe('when the api request fails', () => {
    it('should put the fetch curation fail action with an error', () => {
      const builder = { fetchCuration: jest.fn() } as any
      return expectSaga(curationSaga, builder)
        .provide([[call([builder, builder.fetchCuration], mockCollectionId), throwError(new Error(mockErrorMessage))]])
        .put(fetchCurationFailure(mockErrorMessage))
        .dispatch(fetchCurationRequest(mockCollectionId))
        .run({ silenceTimeout: true })
    })
  })

  describe('when the api request succeeds', () => {
    it('should put the fetch curation success action with the curation', () => {
      const builder = { fetchCuration: jest.fn() } as any
      return expectSaga(curationSaga, builder)
        .provide([[call([builder, builder.fetchCuration], mockCollectionId), {}]])
        .put(fetchCurationSuccess(mockCollectionId, {} as any))
        .dispatch(fetchCurationRequest(mockCollectionId))
        .run({ silenceTimeout: true })
    })
  })
})

describe('when pushing a curation a new curation', () => {
  describe('when the api request fails', () => {
    it('should put the push curation fail action with an error', () => {
      const builder = { pushCuration: jest.fn() } as any
      return expectSaga(curationSaga, builder)
        .provide([[call([builder, builder.pushCuration], mockCollectionId), throwError(new Error(mockErrorMessage))]])
        .put(pushCurationFailure(mockErrorMessage))
        .dispatch(pushCurationRequest(mockCollectionId))
        .run({ silenceTimeout: true })
    })
  })

  describe('when the api request succeeds', () => {
    it('should put the push curation success and fetch curation request', () => {
      const builder = { pushCuration: jest.fn() } as any
      return expectSaga(curationSaga, builder)
        .provide([[call([builder, builder.pushCuration], mockCollectionId), {}]])
        .put(pushCurationSuccess())
        .put(fetchCurationRequest(mockCollectionId))
        .dispatch(pushCurationRequest(mockCollectionId))
        .run({ silenceTimeout: true })
    })
  })
})
