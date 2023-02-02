import { fetchTransactionSuccess } from 'decentraland-dapps/dist/modules/transaction/actions'
import { FetchCollectionsParams } from 'lib/api/builder'
import { PaginationStats } from 'lib/api/pagination'
import {
  fetchCollectionForumPostReplyFailure,
  fetchCollectionForumPostReplyRequest,
  fetchCollectionForumPostReplySuccess
} from 'modules/forum/actions'
import { ForumPostReply } from 'modules/forum/types'
import { closeAllModals, closeModal } from 'modules/modal/actions'
import { fetchCollectionsRequest, fetchCollectionsSuccess, PUBLISH_COLLECTION_SUCCESS } from './actions'
import { collectionReducer as reducer, CollectionState } from './reducer'
import { Collection } from './types'
import { toCollectionObject } from './utils'

describe('when FETCH_TRANSACTION_SUCCESS', () => {
  describe('when PUBLISH_COLLECTION_SUCCESS', () => {
    const originalDateNow = Date.now
    const mockNow = 100

    beforeEach(() => {
      Date.now = () => mockNow
    })

    afterEach(() => {
      Date.now = originalDateNow
    })

    it('should update createdAt reviewedAt and updatedAt to the current date', () => {
      const collectionId = 'id'

      const initialState = {
        data: {
          [collectionId]: {
            createdAt: 0,
            updatedAt: 0,
            reviewedAt: 0
          }
        }
      } as any

      const state = reducer(
        initialState,
        fetchTransactionSuccess({
          actionType: PUBLISH_COLLECTION_SUCCESS,
          payload: {
            collection: {
              id: collectionId
            }
          }
        } as any)
      )

      expect(state.data.id.createdAt).toBe(mockNow)
      expect(state.data.id.reviewedAt).toBe(mockNow)
      expect(state.data.id.updatedAt).toBe(mockNow)
    })
  })
})

describe('when reducing the FETCH_COLLECTIONS_REQUEST action', () => {
  let initialState: CollectionState
  let anExistingCollectionId
  let mockedFetchCollectionParams: FetchCollectionsParams
  beforeEach(() => {
    anExistingCollectionId = 'id'
    initialState = {
      data: {
        [anExistingCollectionId]: {
          id: 'anExistingCollectionId'
        }
      }
    } as CollectionState
    mockedFetchCollectionParams = {
      assignee: 'anAssignee',
      isPublished: false
    } as FetchCollectionsParams
  })

  describe('and it sends the flag to re-use existing results and same parameters', () => {
    it('should not set the loading state', () => {
      const state = reducer(initialState, fetchCollectionsRequest(undefined, mockedFetchCollectionParams, true))
      expect(reducer(initialState, fetchCollectionsRequest(undefined, mockedFetchCollectionParams, true))).toEqual(state)
    })
  })

  describe('and it sends the flag to re-use existing results and new different parameters', () => {
    const newParams = { ...mockedFetchCollectionParams, isPublished: true }
    it('should set the loading state', () => {
      const state = reducer(initialState, fetchCollectionsRequest(undefined, mockedFetchCollectionParams))
      expect(reducer(initialState, fetchCollectionsRequest(undefined, newParams, true))).toEqual({
        ...state,
        loading: [fetchCollectionsRequest(undefined, newParams, true)]
      })
    })
  })

  describe('and it does not send the flag to re-use existing results', () => {
    it('should set the loading state', () => {
      const state = reducer(initialState, fetchCollectionsRequest(undefined, mockedFetchCollectionParams))
      expect(reducer(initialState, fetchCollectionsRequest(undefined, mockedFetchCollectionParams))).toEqual({
        ...state,
        loading: [fetchCollectionsRequest(undefined, mockedFetchCollectionParams)]
      })
    })
  })
})

describe('when FETCH_COLLECTIONS_SUCCESS', () => {
  let initialState: CollectionState
  let anExistingCollectionId: string
  let mockedCollection: Collection, mockedPaginationStats: PaginationStats
  beforeEach(() => {
    initialState = {
      data: {
        [anExistingCollectionId]: {
          id: 'anExistingCollectionId'
        }
      }
    } as CollectionState
    anExistingCollectionId = 'id'
    mockedCollection = {
      id: 'collectionId'
    } as Collection
    mockedPaginationStats = {
      limit: 1,
      page: 1,
      pages: 1,
      total: 1
    } as PaginationStats
  })

  it('should update pagination data if it is passed as parameter', () => {
    const state = reducer(initialState, fetchCollectionsSuccess([mockedCollection], mockedPaginationStats))
    expect(reducer(initialState, fetchCollectionsSuccess([mockedCollection], mockedPaginationStats))).toEqual({
      ...state,
      data: {
        ...state.data,
        ...toCollectionObject([mockedCollection])
      },
      pagination: {
        ...state.pagination,
        ids: [mockedCollection].map(collection => collection.id),
        total: mockedPaginationStats.total,
        currentPage: mockedPaginationStats.page,
        limit: mockedPaginationStats.limit,
        totalPages: mockedPaginationStats.pages
      }
    })
  })

  it('should update params object if it is passed as parameter', () => {
    const firstFetchParams: FetchCollectionsParams = {
      assignee: 'anAssignee',
      isPublished: false
    }

    const state = reducer(initialState, fetchCollectionsSuccess([mockedCollection], mockedPaginationStats))
    expect(reducer(initialState, fetchCollectionsSuccess([mockedCollection], mockedPaginationStats, firstFetchParams))).toEqual({
      ...state,
      data: {
        ...state.data,
        ...toCollectionObject([mockedCollection])
      },
      pagination: {
        ...state.pagination,
        ids: [mockedCollection].map(collection => collection.id),
        total: mockedPaginationStats.total,
        currentPage: mockedPaginationStats.page,
        limit: mockedPaginationStats.limit,
        totalPages: mockedPaginationStats.pages
      },
      lastFetchParams: firstFetchParams
    })
  })
})

describe('when a modal is closed', () => {
  it('should clear the error', () => {
    const initialState = {
      error: 'Some error'
    } as CollectionState
    expect(reducer(initialState, closeModal('PublishWizardCollectionModal')).error).toBe(null)
  })
})

describe('when all modals are closed', () => {
  it('should clear the error', () => {
    const initialState = {
      error: 'Some error'
    } as CollectionState
    expect(reducer(initialState, closeAllModals()).error).toBe(null)
  })
})

describe('when an action of type FETCH_COLLECTION_FORUM_POST_REPLY_REQUEST is called', () => {
  let initialState: CollectionState
  let anExistingCollectionId: string
  beforeEach(() => {
    anExistingCollectionId = 'anExistingCollectionId'
    initialState = {
      data: {
        [anExistingCollectionId]: {
          id: anExistingCollectionId,
          forumLink: 'https://forum/anExistingCollectionId/1234'
        }
      }
    } as CollectionState
  })

  it('should set the loading state', () => {
    const state = reducer(initialState, fetchCollectionForumPostReplyRequest(anExistingCollectionId))
    expect(reducer(initialState, fetchCollectionForumPostReplyRequest(anExistingCollectionId))).toEqual({
      ...state,
      loading: [fetchCollectionForumPostReplyRequest(anExistingCollectionId)]
    })
  })
})

describe('when an action of type FETCH_COLLECTION_FORUM_POST_REPLY_SUCCESS is called', () => {
  let initialState: CollectionState
  let collection: Collection
  let topicId: number
  beforeEach(() => {
    collection = { id: 'anExistingCollectionId' } as Collection
    topicId = 1234
    initialState = {
      data: {
        [collection.id]: {
          id: collection.id,
          forumLink: `https://forum/${collection.id}/${topicId}`
        }
      }
    } as CollectionState
  })

  it('should set the forumPostReply state', () => {
    const forumPostReply: ForumPostReply = {
      topic_id: topicId,
      highest_post_number: 1,
      show_read_indicator: true,
      last_read_post_number: 0
    }
    const state = reducer(initialState, fetchCollectionForumPostReplySuccess(collection, forumPostReply))
    expect(reducer(initialState, fetchCollectionForumPostReplySuccess(collection, forumPostReply))).toEqual({
      ...state,
      data: {
        ...initialState.data,
        [collection.id]: { ...initialState.data[collection.id], forumPostReply }
      },
      loading: []
    })
  })
})

describe('when an action of type FETCH_COLLECTION_FORUM_POST_REPLY_FAILURE is called', () => {
  let initialState: CollectionState
  let collection: Collection
  let topicId: number
  beforeEach(() => {
    collection = { id: 'anExistingCollectionId' } as Collection
    topicId = 1234
    initialState = {
      data: {
        [collection.id]: {
          id: collection.id,
          forumLink: `https://forum/${collection.id}/${topicId}`
        }
      }
    } as CollectionState
  })

  it('should set the error state', () => {
    const error = 'anError'
    const state = reducer(initialState, fetchCollectionForumPostReplyFailure(collection, error))
    expect(reducer(initialState, fetchCollectionForumPostReplyFailure(collection, error))).toEqual({ ...state, error, loading: [] })
  })
})
