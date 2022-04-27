import {
  fetchCollectionCurationRequest,
  fetchCollectionCurationSuccess,
  fetchCollectionCurationsRequest,
  fetchCollectionCurationsSuccess,
  pushCollectionCurationRequest,
  fetchCollectionCurationsFailure,
  fetchCollectionCurationFailure,
  pushCollectionCurationFailure,
  rejectCollectionCurationRequest,
  rejectCollectionCurationFailure,
  approveCollectionCurationRequest,
  approveCollectionCurationFailure,
  setCollectionCurationAssigneeRequest,
  setCollectionCurationAssigneeSuccess,
  setCollectionCurationAssigneeFailure
} from './actions'
import { INITIAL_STATE, collectionCurationReducer, CollectionCurationState } from './reducer'
import { CollectionCuration } from './types'
import { CurationStatus } from '../types'

const getMockCuration = (props: Partial<CollectionCuration> = {}): CollectionCuration => ({
  id: 'id',
  collectionId: 'collectionId',
  status: CurationStatus.PENDING,
  createdAt: 0,
  updatedAt: 0,
  ...props
})

describe('when an action of type FETCH_COLLECTION_CURATIONS_REQUEST is called', () => {
  it('should add a fetchCollectionCurationsRequest to the loading array', () => {
    expect(collectionCurationReducer(INITIAL_STATE, fetchCollectionCurationsRequest())).toStrictEqual({
      ...INITIAL_STATE,
      loading: [fetchCollectionCurationsRequest()]
    })
  })
})

describe('when an action of type SET_COLLECTION_CURATION_ASSIGNEE_REQUEST is called', () => {
  it('should add a fetchCollectionCurationsRequest to the loading array', () => {
    expect(
      collectionCurationReducer(INITIAL_STATE, setCollectionCurationAssigneeRequest('collectionId', '0xassignee', getMockCuration()))
    ).toStrictEqual({
      ...INITIAL_STATE,
      loading: [setCollectionCurationAssigneeRequest('collectionId', '0xassignee', getMockCuration())]
    })
  })
})

describe('when an action of type FETCH_COLLECTION_CURATION_REQUEST is called', () => {
  it('should add a fetchCollectionCurationRequest to the loading array', () => {
    expect(collectionCurationReducer(INITIAL_STATE, fetchCollectionCurationRequest('collectionId'))).toStrictEqual({
      ...INITIAL_STATE,
      loading: [fetchCollectionCurationRequest('collectionId')]
    })
  })
})

describe('when an action of type PUSH_COLLECTION_CURATION_REQUEST is called', () => {
  it('should add a pushCollectionCurationRequest to the loading array', () => {
    expect(collectionCurationReducer(INITIAL_STATE, pushCollectionCurationRequest('collectionId'))).toStrictEqual({
      ...INITIAL_STATE,
      loading: [pushCollectionCurationRequest('collectionId')]
    })
  })
})

describe('when an action of type FETCH_COLLECTION_CURATIONS_SUCCESS is called', () => {
  it('should add the collections to the data, remove the action from loading and set the error to null', () => {
    const state: CollectionCurationState = {
      data: {},
      loading: [fetchCollectionCurationsRequest()],
      error: 'Some Error'
    }

    expect(collectionCurationReducer(state, fetchCollectionCurationsSuccess([getMockCuration()]))).toStrictEqual({
      data: {
        collectionId: getMockCuration()
      },
      loading: [],
      error: null
    })
  })
})

describe('when an action of type FETCH_COLLECTION_CURATION_SUCCESS is called', () => {
  describe('when the curation does not already exist in the state', () => {
    it('should add the curation to the data, remove the request from loading and set the error to null', () => {
      const state: CollectionCurationState = {
        data: {},
        loading: [fetchCollectionCurationRequest('collectionId')],
        error: 'Some Error'
      }

      expect(collectionCurationReducer(state, fetchCollectionCurationSuccess('collectionId', getMockCuration()))).toStrictEqual({
        data: { collectionId: getMockCuration() },
        loading: [],
        error: null
      })
    })
  })

  describe('when the curation already exists in data', () => {
    it('should replace it', () => {
      const state: CollectionCurationState = {
        data: {
          collectionId: getMockCuration()
        },
        loading: [fetchCollectionCurationRequest('collectionId')],
        error: 'Some Error'
      }

      const newCuration = getMockCuration({ updatedAt: 100, createdAt: 100, status: CurationStatus.APPROVED })

      expect(collectionCurationReducer(state, fetchCollectionCurationSuccess('collectionId', newCuration))).toStrictEqual({
        data: { collectionId: newCuration },
        loading: [],
        error: null
      })
    })
  })

  describe('when the curation already exists in data but undefined is provided in the payload', () => {
    it('should remove the curation from data', () => {
      const state: CollectionCurationState = {
        data: {
          collectionId: getMockCuration()
        },
        loading: [fetchCollectionCurationRequest('collectionId')],
        error: 'Some Error'
      }

      expect(collectionCurationReducer(state, fetchCollectionCurationSuccess('collectionId'))).toStrictEqual(INITIAL_STATE)
    })
  })
})

describe('when an action of type SET_COLLECTION_CURATION_ASSIGNEE_SUCCESS is called', () => {
  describe('when the curation does not already exist in the state', () => {
    it('should add the curation to the data, remove the request from loading and set the error to null', () => {
      const state: CollectionCurationState = {
        data: {},
        loading: [setCollectionCurationAssigneeRequest('collectionId', '0xassignee', getMockCuration())],
        error: 'Some Error'
      }

      expect(collectionCurationReducer(state, setCollectionCurationAssigneeSuccess('collectionId', getMockCuration()))).toStrictEqual({
        data: { collectionId: getMockCuration() },
        loading: [],
        error: null
      })
    })
  })

  describe('when the curation already exists in data', () => {
    it('should replace it', () => {
      const state: CollectionCurationState = {
        data: {
          collectionId: getMockCuration()
        },
        loading: [setCollectionCurationAssigneeRequest('collectionId', '0xassignee', getMockCuration())],
        error: 'Some Error'
      }

      const newCuration = getMockCuration({ updatedAt: 100, createdAt: 100, status: CurationStatus.APPROVED })

      expect(collectionCurationReducer(state, setCollectionCurationAssigneeSuccess('collectionId', newCuration))).toStrictEqual({
        data: { collectionId: newCuration },
        loading: [],
        error: null
      })
    })
  })
})

describe('when an action of type FETCH_COLLECTION_CURATIONS_FAILURE is called', () => {
  it('should remove the corresponding request action, and set the error', () => {
    expect(
      collectionCurationReducer(
        { ...INITIAL_STATE, loading: [fetchCollectionCurationsRequest()] },
        fetchCollectionCurationsFailure('Some Error')
      )
    ).toStrictEqual({
      ...INITIAL_STATE,
      error: 'Some Error'
    })
  })
})

describe('when an action of type SET_COLLECTION_CURATION_ASSIGNEE_FAILURE is called', () => {
  it('should remove the corresponding request action, and set the error', () => {
    expect(
      collectionCurationReducer(
        { ...INITIAL_STATE, loading: [setCollectionCurationAssigneeRequest('collectionId', '0xassignee', getMockCuration())] },
        setCollectionCurationAssigneeFailure('collectionId', 'Some Error')
      )
    ).toStrictEqual({
      ...INITIAL_STATE,
      error: 'Some Error'
    })
  })
})

describe('when an action of type FETCH_COLLECTION_CURATION_FAILURE is called', () => {
  it('should remove the corresponding request action, and set the error', () => {
    expect(
      collectionCurationReducer(
        { ...INITIAL_STATE, loading: [fetchCollectionCurationRequest('collectionId')] },
        fetchCollectionCurationFailure('Some Error')
      )
    ).toStrictEqual({
      ...INITIAL_STATE,
      error: 'Some Error'
    })
  })
})

describe('when an action of type PUSH_COLLECTION_CURATION_FAILURE is called', () => {
  it('should remove the corresponding request action, and set the error', () => {
    expect(
      collectionCurationReducer(
        { ...INITIAL_STATE, loading: [pushCollectionCurationRequest('collectionId')] },
        pushCollectionCurationFailure('Some Error')
      )
    ).toStrictEqual({
      ...INITIAL_STATE,
      error: 'Some Error'
    })
  })
})

describe('when an action of type REJECT_COLLECTION_CURATION_FAILURE is called', () => {
  it('should remove the corresponding request action, and set the error', () => {
    expect(
      collectionCurationReducer(
        { ...INITIAL_STATE, loading: [rejectCollectionCurationRequest('collectionId')] },
        rejectCollectionCurationFailure('collectionId', 'Some Error')
      )
    ).toStrictEqual({
      ...INITIAL_STATE,
      error: 'Some Error'
    })
  })
})

describe('when an action of type APPROVE_COLLECTION_CURATION_FAILURE is called', () => {
  it('should remove the corresponding request action, and set the error', () => {
    expect(
      collectionCurationReducer(
        { ...INITIAL_STATE, loading: [approveCollectionCurationRequest('collectionId')] },
        approveCollectionCurationFailure('collectionId', 'Some Error')
      )
    ).toStrictEqual({
      ...INITIAL_STATE,
      error: 'Some Error'
    })
  })
})
