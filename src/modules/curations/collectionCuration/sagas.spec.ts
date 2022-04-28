import { call, select } from '@redux-saga/core/effects'
import { closeModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { SHOW_TOAST } from 'decentraland-dapps/dist/modules/toast/actions'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { ToastType } from 'decentraland-ui'
import { BuilderAPI } from 'lib/api/builder'
import { getCollection } from 'modules/collection/selectors'
import { Collection } from 'modules/collection/types'
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
  pushCollectionCurationSuccess,
  setCollectionCurationAssigneeFailure,
  setCollectionCurationAssigneeRequest,
  setCollectionCurationAssigneeSuccess
} from './actions'

import { collectionCurationSaga } from './sagas'
import { CollectionCuration } from './types'

jest.mock('./toasts', () => {
  return {
    getSuccessfulAssignmentToastBody: jest.fn()
  }
})

const mockAddress = '0x6D7227d6F36FC997D53B4646132b3B55D751cc7c'
const mockCollectionId = 'collectionId'
const mockErrorMessage = 'Some Error'

const mockBuilder = ({
  fetchCurations: jest.fn(),
  fetchCuration: jest.fn(),
  pushCuration: jest.fn(),
  updateCuration: jest.fn()
} as any) as BuilderAPI

afterEach(() => {
  jest.clearAllMocks()
})

describe('when fetching curations', () => {
  describe('when the api request fails', () => {
    it('should put the fetch curations fail action with an error', () => {
      return expectSaga(collectionCurationSaga, mockBuilder)
        .provide([[call([mockBuilder, mockBuilder.fetchCurations]), throwError(new Error(mockErrorMessage))]])
        .put(fetchCollectionCurationsFailure(mockErrorMessage))
        .dispatch(fetchCollectionCurationsRequest())
        .run({ silenceTimeout: true })
    })
  })

  describe('when the api request succeeds', () => {
    it('should put the fetch curations success action with the curations', () => {
      return expectSaga(collectionCurationSaga, mockBuilder)
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
      return expectSaga(collectionCurationSaga, mockBuilder)
        .provide([[call([mockBuilder, mockBuilder.fetchCuration], mockCollectionId), throwError(new Error(mockErrorMessage))]])
        .put(fetchCollectionCurationFailure(mockErrorMessage))
        .dispatch(fetchCollectionCurationRequest(mockCollectionId))
        .run({ silenceTimeout: true })
    })
  })

  describe('when the api request succeeds', () => {
    it('should put the fetch curation success action with the curation', () => {
      return expectSaga(collectionCurationSaga, mockBuilder)
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
      return expectSaga(collectionCurationSaga, mockBuilder)
        .provide([[call([mockBuilder, mockBuilder.pushCuration], mockCollectionId), throwError(new Error(mockErrorMessage))]])
        .put(pushCollectionCurationFailure(mockErrorMessage))
        .dispatch(pushCollectionCurationRequest(mockCollectionId))
        .run({ silenceTimeout: true })
    })
  })

  describe('when the api request succeeds', () => {
    it('should put the push curation success and fetch curation request', () => {
      return expectSaga(collectionCurationSaga, mockBuilder)
        .provide([[call([mockBuilder, mockBuilder.pushCuration], mockCollectionId), {}]])
        .put(pushCollectionCurationSuccess())
        .put(fetchCollectionCurationRequest(mockCollectionId))
        .dispatch(pushCollectionCurationRequest(mockCollectionId))
        .run({ silenceTimeout: true })
    })
  })
})

describe('when assigning a curator', () => {
  let assignee: string
  let mockCollection: Collection
  beforeEach(() => {
    assignee = '0xassignee'
    mockCollection = {
      name: 'a collection'
    } as Collection
  })
  describe('and there is no curation created yet', () => {
    describe('when the api request fails', () => {
      it('should put the push curation fail action with an error, close the modal and show the toast with an error', () => {
        return expectSaga(collectionCurationSaga, mockBuilder)
          .provide([
            [select(getAddress), [mockAddress]],
            [select(getCollection, mockCollectionId), mockCollection],
            [call([mockBuilder, mockBuilder.pushCuration], mockCollectionId, assignee), throwError(new Error(mockErrorMessage))]
          ])
          .put(setCollectionCurationAssigneeFailure(mockCollectionId, mockErrorMessage))
          .put(closeModal('EditCurationAssigneeModal'))
          .put.like({ action: { type: SHOW_TOAST, payload: { toast: { type: ToastType.ERROR } } } })
          .dispatch(setCollectionCurationAssigneeRequest(mockCollectionId, assignee, null))
          .run({ silenceTimeout: true })
      })
    })

    describe('when the api request succeeds', () => {
      let mockCurationResponse: CollectionCuration
      beforeEach(() => {
        mockCurationResponse = {
          assignee
        } as CollectionCuration
      })
      it('should put the push curation success and fetch curation request, close the modal and show the toast', () => {
        return expectSaga(collectionCurationSaga, mockBuilder)
          .provide([
            [select(getAddress), [mockAddress]],
            [select(getCollection, mockCollectionId), mockCollection],
            [call([mockBuilder, mockBuilder.pushCuration], mockCollectionId, assignee), mockCurationResponse]
          ])
          .put(setCollectionCurationAssigneeSuccess(mockCollectionId, mockCurationResponse))
          .put(closeModal('EditCurationAssigneeModal'))
          .put.like({ action: { type: SHOW_TOAST, payload: { toast: { type: ToastType.INFO } } } })
          .dispatch(setCollectionCurationAssigneeRequest(mockCollectionId, assignee, null))
          .run({ silenceTimeout: true })
      })
    })
  })

  describe('and there is already a curation', () => {
    let mockCuration: CollectionCuration
    beforeEach(() => {
      mockCuration = {
        assignee: 'old assignee'
      } as CollectionCuration
    })
    describe('when the api request fails', () => {
      it('should put the push curation fail action with an error, close the modal and show the toast with an error', () => {
        return expectSaga(collectionCurationSaga, mockBuilder)
          .provide([
            [select(getAddress), [mockAddress]],
            [select(getCollection, mockCollectionId), mockCollection],
            [call([mockBuilder, mockBuilder.updateCuration], mockCollectionId, { assignee }), throwError(new Error(mockErrorMessage))]
          ])
          .dispatch(setCollectionCurationAssigneeRequest(mockCollectionId, assignee, mockCuration))
          .put(setCollectionCurationAssigneeFailure(mockCollectionId, mockErrorMessage))
          .put(closeModal('EditCurationAssigneeModal'))
          .put.like({ action: { type: SHOW_TOAST, payload: { toast: { type: ToastType.ERROR } } } })
          .run({ silenceTimeout: true })
      })
    })

    describe('when the api request succeeds', () => {
      let mockCurationResponse: CollectionCuration
      beforeEach(() => {
        mockCurationResponse = {
          assignee
        } as CollectionCuration
      })
      it('should put the push curation success and fetch curation request, close the modal and show the toast', () => {
        return expectSaga(collectionCurationSaga, mockBuilder)
          .provide([
            [select(getAddress), [mockAddress]],
            [select(getCollection, mockCollectionId), mockCollection],
            [call([mockBuilder, mockBuilder.updateCuration], mockCollectionId, { assignee }), mockCurationResponse]
          ])
          .dispatch(setCollectionCurationAssigneeRequest(mockCollectionId, assignee, mockCuration))
          .put(setCollectionCurationAssigneeSuccess(mockCollectionId, mockCurationResponse))
          .put(closeModal('EditCurationAssigneeModal'))
          .put.like({ action: { type: SHOW_TOAST, payload: { toast: { type: ToastType.INFO } } } })
          .run({ silenceTimeout: true })
      })
    })
  })
})
