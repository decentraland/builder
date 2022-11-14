import {
  getCurationsByCollectionId,
  getState,
  getLoading,
  getError,
  getCuration,
  getCurations,
  getHasPendingCollectionCuration
} from './selectors'
import { INITIAL_STATE } from './reducer'
import { FETCH_COLLECTION_CURATION_REQUEST } from './actions'
import { CollectionCuration } from './types'
import { CurationStatus } from '../types'

const getMockCuration = (props: Partial<CollectionCuration> = {}): CollectionCuration => ({
  id: 'id',
  collectionId: 'collectionId',
  createdAt: 0,
  status: CurationStatus.PENDING,
  updatedAt: 0,
  ...props
})

describe('when calling getState', () => {
  it('should return the current state', () => {
    const state = {
      collectionCuration: INITIAL_STATE
    } as any

    expect(getState(state)).toBe(INITIAL_STATE)
  })
})

describe('when calling getCurationsByCollectionId', () => {
  it('should return a record of curations by collection id as index', () => {
    const state = {
      collectionCuration: {
        ...INITIAL_STATE,
        data: {
          collectionId: getMockCuration()
        }
      }
    } as any

    expect(getCurationsByCollectionId(state)).toBe(state.collectionCuration.data)
  })
})

describe('when calling getLoading', () => {
  it('should return list of actions being loaded', () => {
    const state = {
      collectionCuration: {
        ...INITIAL_STATE,
        loading: [FETCH_COLLECTION_CURATION_REQUEST]
      }
    } as any

    expect(getLoading(state)).toBe(state.collectionCuration.loading)
  })
})

describe('when calling getError', () => {
  it('should return the current curation error', () => {
    const state = {
      collectionCuration: {
        ...INITIAL_STATE,
        error: 'Some Error'
      }
    } as any

    expect(getError(state)).toBe(state.collectionCuration.error)
  })
})

describe('when calling getCuration', () => {
  describe('when the collection for the collectionId provided does not exist', () => {
    it('should return undefined', () => {
      const state = {
        collectionCuration: INITIAL_STATE
      } as any

      expect(getCuration(state, 'collectionId')).toBeUndefined()
    })
  })

  describe('when the collection for the collectionId provided exists', () => {
    it('should return a curation', () => {
      const state = {
        collectionCuration: {
          ...INITIAL_STATE,
          data: {
            collectionId: getMockCuration()
          }
        }
      } as any

      expect(getCuration(state, 'collectionId')).toBe(state.collectionCuration.data.collectionId)
    })
  })
})

describe('when calling getCurations', () => {
  it('should return a collection of curations', () => {
    const state = {
      collectionCuration: {
        ...INITIAL_STATE,
        data: {
          collectionId: getMockCuration()
        }
      }
    } as any

    expect(getCurations(state)).toStrictEqual([state.collectionCuration.data.collectionId])
  })
})

describe('when calling getHasPendingCollectionCuration', () => {
  it('should return a collection of curations', () => {
    const state = {
      collectionCuration: {
        ...INITIAL_STATE,
        data: {
          collectionId1: getMockCuration({ collectionId: 'collectionId1', status: CurationStatus.PENDING }),
          collectionId2: getMockCuration({ collectionId: 'collectionId2', status: CurationStatus.REJECTED }),
          collectionId3: getMockCuration({ collectionId: 'collectionId2', status: CurationStatus.APPROVED })
        }
      }
    } as any

    expect(getHasPendingCollectionCuration(state, 'collectionId1')).toBeTruthy()
    expect(getHasPendingCollectionCuration(state, 'collectionId2')).toBeFalsy()
    expect(getHasPendingCollectionCuration(state, 'collectionId3')).toBeFalsy()
    expect(getHasPendingCollectionCuration(state, 'collectionId4')).toBeFalsy()
  })
})
