import { fetchTransactionSuccess } from 'decentraland-dapps/dist/modules/transaction/actions'
import { PaginationStats } from 'lib/api/pagination'
import { closeAllModals, closeModal } from 'modules/modal/actions'
import { fetchCollectionsSuccess, PUBLISH_COLLECTION_SUCCESS } from './actions'
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

describe('when FETCH_COLLECTIONS_SUCCESS', () => {
  let mockedCollection: Collection, mockedPaginationStats: PaginationStats
  beforeEach(() => {
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
    const anExistingCollectionId = 'id'
    const initialState = {
      data: {
        [anExistingCollectionId]: {
          id: 'anExistingCollectionId'
        }
      }
    } as any

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
})

describe('when a modal is closed', () => {
  it('should clear the error', () => {
    const initialState = {
      error: 'Some error'
    } as CollectionState
    expect(reducer(initialState, closeModal('PublishCollectionModal')).error).toBe(null)
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
