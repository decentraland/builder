import {
  fetchCurationRequest,
  fetchCurationSuccess,
  fetchCurationsRequest,
  fetchCurationsSuccess,
  pushCurationRequest,
  fetchCurationsFailure,
  fetchCurationFailure,
  pushCurationFailure,
  rejectCurationRequest,
  rejectCurationFailure,
  approveCurationRequest,
  approveCurationFailure
} from './actions'
import { INITIAL_STATE, curationReducer, CurationState } from './reducer'
import { Curation } from './types'

const getMockCuration = (props: Partial<Curation> = {}): Curation => ({
  id: 'id',
  collectionId: 'collectionId',
  status: 'pending',
  created_at: 0,
  updated_at: 0,
  ...props
})

describe('when an action of type FETCH_CURATIONS_REQUEST is called', () => {
  it('should add a fetchCurationsRequest to the loading array', () => {
    expect(curationReducer(INITIAL_STATE, fetchCurationsRequest())).toStrictEqual({
      ...INITIAL_STATE,
      loading: [fetchCurationsRequest()]
    })
  })
})

describe('when an action of type FETCH_CURATION_REQUEST is called', () => {
  it('should add a fetchCurationRequest to the loading array', () => {
    expect(curationReducer(INITIAL_STATE, fetchCurationRequest('collectionId'))).toStrictEqual({
      ...INITIAL_STATE,
      loading: [fetchCurationRequest('collectionId')]
    })
  })
})

describe('when an action of type PUSH_CURATION_REQUEST is called', () => {
  it('should add a pushCurationRequest to the loading array', () => {
    expect(curationReducer(INITIAL_STATE, pushCurationRequest('collectionId'))).toStrictEqual({
      ...INITIAL_STATE,
      loading: [pushCurationRequest('collectionId')]
    })
  })
})

describe('when an action of type FETCH_CURATIONS_SUCCESS is called', () => {
  it('should add the collections to the data, remove the action from loading and set the error to null', () => {
    const state: CurationState = {
      data: {},
      loading: [fetchCurationsRequest()],
      error: 'Some Error'
    }

    expect(curationReducer(state, fetchCurationsSuccess([getMockCuration()]))).toStrictEqual({
      data: {
        collectionId: getMockCuration()
      },
      loading: [],
      error: null
    })
  })
})

describe('when an action of type FETCH_CURATION_SUCCESS is called', () => {
  describe('when the curation does not already exist in the state', () => {
    it('should add the curation to the data, remove the request from loading and set the error to null', () => {
      const state: CurationState = {
        data: {},
        loading: [fetchCurationRequest('collectionId')],
        error: 'Some Error'
      }

      expect(curationReducer(state, fetchCurationSuccess('collectionId', getMockCuration()))).toStrictEqual({
        data: { collectionId: getMockCuration() },
        loading: [],
        error: null
      })
    })
  })

  describe('when the curation already exists in data', () => {
    it('should replace it', () => {
      const state: CurationState = {
        data: {
          collectionId: getMockCuration()
        },
        loading: [fetchCurationRequest('collectionId')],
        error: 'Some Error'
      }

      const newCuration = getMockCuration({ updated_at: 100, created_at: 100, status: 'approved' })

      expect(curationReducer(state, fetchCurationSuccess('collectionId', newCuration))).toStrictEqual({
        data: { collectionId: newCuration },
        loading: [],
        error: null
      })
    })
  })

  describe('when the curation already exists in data but undefined is provided in the payload', () => {
    it('should remove the curation from data', () => {
      const state: CurationState = {
        data: {
          collectionId: getMockCuration()
        },
        loading: [fetchCurationRequest('collectionId')],
        error: 'Some Error'
      }

      expect(curationReducer(state, fetchCurationSuccess('collectionId'))).toStrictEqual(INITIAL_STATE)
    })
  })
})

describe('when an action of type FETCH_CURATIONS_FAILURE is called', () => {
  it('should remove the corresponding request action, and set the error', () => {
    expect(curationReducer({ ...INITIAL_STATE, loading: [fetchCurationsRequest()] }, fetchCurationsFailure('Some Error'))).toStrictEqual({
      ...INITIAL_STATE,
      error: 'Some Error'
    })
  })
})

describe('when an action of type FETCH_CURATION_FAILURE is called', () => {
  it('should remove the corresponding request action, and set the error', () => {
    expect(
      curationReducer({ ...INITIAL_STATE, loading: [fetchCurationRequest('collectionId')] }, fetchCurationFailure('Some Error'))
    ).toStrictEqual({
      ...INITIAL_STATE,
      error: 'Some Error'
    })
  })
})

describe('when an action of type PUSH_CURATION_FAILURE is called', () => {
  it('should remove the corresponding request action, and set the error', () => {
    expect(
      curationReducer({ ...INITIAL_STATE, loading: [pushCurationRequest('collectionId')] }, pushCurationFailure('Some Error'))
    ).toStrictEqual({
      ...INITIAL_STATE,
      error: 'Some Error'
    })
  })
})

describe('when an action of type REJECT_CURATION_FAILURE is called', () => {
  it('should remove the corresponding request action, and set the error', () => {
    expect(
      curationReducer({ ...INITIAL_STATE, loading: [rejectCurationRequest('collectionId')] }, rejectCurationFailure('Some Error'))
    ).toStrictEqual({
      ...INITIAL_STATE,
      error: 'Some Error'
    })
  })
})

describe('when an action of type APPROVE_CURATION_FAILURE is called', () => {
  it('should remove the corresponding request action, and set the error', () => {
    expect(
      curationReducer({ ...INITIAL_STATE, loading: [approveCurationRequest('collectionId')] }, approveCurationFailure('Some Error'))
    ).toStrictEqual({
      ...INITIAL_STATE,
      error: 'Some Error'
    })
  })
})
