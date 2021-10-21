import { getCurationsByCollectionId, getState, getLoading, getError, getCuration, getCurations, getHasPendingCuration } from './selectors'
import { INITIAL_STATE } from './reducer'
import { FETCH_CURATION_REQUEST } from './actions'
import { Curation, CurationStatus } from './types'

const getMockCuration = (props: Partial<Curation> = {}): Curation => ({
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
      curation: INITIAL_STATE
    } as any

    expect(getState(state)).toBe(INITIAL_STATE)
  })
})

describe('when calling getCurationsByCollectionId', () => {
  it('should return a record of curations by collection id as index', () => {
    const state = {
      curation: {
        ...INITIAL_STATE,
        data: {
          collectionId: getMockCuration()
        }
      }
    } as any

    expect(getCurationsByCollectionId(state)).toBe(state.curation.data)
  })
})

describe('when calling getLoading', () => {
  it('should return list of actions being loaded', () => {
    const state = {
      curation: {
        ...INITIAL_STATE,
        loading: [FETCH_CURATION_REQUEST]
      }
    } as any

    expect(getLoading(state)).toBe(state.curation.loading)
  })
})

describe('when calling getError', () => {
  it('should return the current curation error', () => {
    const state = {
      curation: {
        ...INITIAL_STATE,
        error: 'Some Error'
      }
    } as any

    expect(getError(state)).toBe(state.curation.error)
  })
})

describe('when calling getCuration', () => {
  describe('when the collection for the collectionId provided does not exist', () => {
    it('should return undefined', () => {
      const state = {
        curation: INITIAL_STATE
      } as any

      expect(getCuration(state, 'collectionId')).toBeUndefined()
    })
  })

  describe('when the collection for the collectionId provided exists', () => {
    it('should return a curation', () => {
      const state = {
        curation: {
          ...INITIAL_STATE,
          data: {
            collectionId: getMockCuration()
          }
        }
      } as any

      expect(getCuration(state, 'collectionId')).toBe(state.curation.data.collectionId)
    })
  })
})

describe('when calling getCurations', () => {
  it('should return a collection of curations', () => {
    const state = {
      curation: {
        ...INITIAL_STATE,
        data: {
          collectionId: getMockCuration()
        }
      }
    } as any

    expect(getCurations(state)).toStrictEqual([state.curation.data.collectionId])
  })
})

describe('when calling getHasPendingCuration', () => {
  it('should return a collection of curations', () => {
    const state = {
      curation: {
        ...INITIAL_STATE,
        data: {
          collectionId1: getMockCuration({ collectionId: 'collectionId1', status: CurationStatus.PENDING }),
          collectionId2: getMockCuration({ collectionId: 'collectionId2', status: CurationStatus.REJECTED }),
          collectionId3: getMockCuration({ collectionId: 'collectionId2', status: CurationStatus.APPROVED })
        }
      }
    } as any

    expect(getHasPendingCuration(state, 'collectionId1')).toBeTruthy()
    expect(getHasPendingCuration(state, 'collectionId2')).toBeFalsy()
    expect(getHasPendingCuration(state, 'collectionId3')).toBeFalsy()
    expect(getHasPendingCuration(state, 'collectionId4')).toBeFalsy()
  })
})
