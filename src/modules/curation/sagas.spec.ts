import { call } from '@redux-saga/core/effects'
import { expectSaga } from 'redux-saga-test-plan'
import { throwError } from 'redux-saga-test-plan/providers'
import {
  fetchCurationFailure,
  fetchCurationRequest,
  fetchCurationsFailure,
  fetchCurationsRequest,
  fetchCurationsSuccess,
  fetchCurationSuccess
} from './actions'
import { curationSaga } from './sagas'

describe('when fetching curations', () => {
  describe('when the api request fails', () => {
    it('should put the fetch curations fail action with the error', () => {
      const builder = { fetchCurations: jest.fn() } as any
      return expectSaga(curationSaga, builder)
        .provide([[call([builder, builder.fetchCurations]), throwError(new Error('Some Error'))]])
        .put(fetchCurationsFailure('Some Error'))
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
    it('should put the fetch curation fail action with the error', () => {
      const builder = { fetchCuration: jest.fn() } as any
      return expectSaga(curationSaga, builder)
        .provide([[call([builder, builder.fetchCuration], 'collectionId'), throwError(new Error('Some Error'))]])
        .put(fetchCurationFailure('Some Error'))
        .dispatch(fetchCurationRequest('collectionId'))
        .run({ silenceTimeout: true })
    })
  })

  describe('when the api request succeeds', () => {
    it('should put the fetch curation success action with the curation', () => {
      const builder = { fetchCuration: jest.fn() } as any
      return expectSaga(curationSaga, builder)
        .provide([[call([builder, builder.fetchCuration], 'collectionId'), {}]])
        .put(fetchCurationSuccess('collectionId', {} as any))
        .dispatch(fetchCurationRequest('collectionId'))
        .run({ silenceTimeout: true })
    })
  })
})
