import { getState, getLoading, getError, getItemCurations, getItemCurationsByItemId } from './selectors'
import { INITIAL_STATE } from './reducer'
import { FETCH_ITEM_CURATIONS_REQUEST } from './actions'
import { ItemCuration } from './types'
import { CurationStatus } from '../types'

const mockedCollectionId = 'collectionId'

const getMockCuration = (props: Partial<ItemCuration> = {}): ItemCuration => ({
  id: 'id',
  itemId: 'itemId',
  createdAt: 0,
  status: CurationStatus.PENDING,
  updatedAt: 0,
  contentHash: 'aHash',
  ...props
})

describe('when calling getState', () => {
  it('should return the current state', () => {
    const state = {
      itemCuration: INITIAL_STATE
    } as any

    expect(getState(state)).toBe(INITIAL_STATE)
  })
})

describe('when calling getItemCurations', () => {
  describe('when the collection for the collectionId provided exists', () => {
    it('should return an array of item curations', () => {
      const state = {
        itemCuration: {
          ...INITIAL_STATE,
          data: {
            [mockedCollectionId]: [getMockCuration()]
          }
        }
      } as any

      expect(getItemCurations(state, mockedCollectionId)).toBe(state.itemCuration.data[mockedCollectionId])
    })
  })

  describe('when the collection for the collectionId provided does not exist', () => {
    it('should return undefined', () => {
      const state = {
        itemCuration: INITIAL_STATE
      } as any

      expect(getItemCurations(state, 'invalidCollectionId')).toBeUndefined()
    })
  })
})

describe('when calling getLoading', () => {
  it('should return list of actions being loaded', () => {
    const state = {
      itemCuration: {
        ...INITIAL_STATE,
        loading: [FETCH_ITEM_CURATIONS_REQUEST]
      }
    } as any

    expect(getLoading(state)).toBe(state.itemCuration.loading)
  })
})

describe('when calling getError', () => {
  it('should return the current curation error', () => {
    const state = {
      itemCuration: {
        ...INITIAL_STATE,
        error: 'Some Error'
      }
    } as any

    expect(getError(state)).toBe(state.itemCuration.error)
  })
})

describe('when calling getItemCurationsByItemId', () => {
  let state: any

  beforeEach(() => {
    state = {
      itemCuration: {
        ...INITIAL_STATE,
        data: {
          [mockedCollectionId]: [getMockCuration()]
        }
      }
    } as any
  })

  it('should return a record of curations by itemId as index', () => {
    const mockedCuration = getMockCuration()
    expect(getItemCurationsByItemId(state)).toStrictEqual({ [mockedCuration.itemId]: mockedCuration })
  })
})
