import { fetchTransactionSuccess } from 'decentraland-dapps/dist/modules/transaction/actions'
import { PUBLISH_COLLECTION_SUCCESS } from './actions'
import { collectionReducer as reducer } from './reducer'

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
