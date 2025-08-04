import { BodyShape, WearableCategory } from '@dcl/schemas'
import { RootState } from 'modules/common/types'
import { wearable } from 'specs/editor'
import { FETCH_BASE_WEARABLES_REQUEST } from './actions'
import { INITIAL_STATE } from './reducer'
import { getFetchingBaseWearablesError, getSelectedBaseWearablesByBodyShape, isLoadingBaseWearables } from './selectors'

let state: RootState
const originalLocation = window.location

beforeAll(() => {
  window.location = {
    ...originalLocation
  }
})

afterAll(() => {
  window.location = originalLocation
})

beforeEach(() => {
  state = {
    editor: {
      ...INITIAL_STATE
    }
  } as RootState
})

describe('when getting if the base wearables are being loaded', () => {
  describe('and the base wearables are being fetched', () => {
    beforeEach(() => {
      state = {
        ...state,
        editor: {
          ...state.editor,
          loading: [{ type: FETCH_BASE_WEARABLES_REQUEST }],
          baseWearables: [],
          fetchingBaseWearablesError: null
        }
      }
    })

    it('should return true', () => {
      expect(isLoadingBaseWearables(state)).toBe(true)
    })
  })

  describe("and there are no base wearables and there's no error", () => {
    beforeEach(() => {
      state = {
        ...state,
        editor: {
          ...state.editor,
          loading: [],
          baseWearables: [],
          fetchingBaseWearablesError: null
        }
      }
    })

    it('should return true', () => {
      expect(isLoadingBaseWearables(state)).toBe(true)
    })
  })

  describe("and the base wearables are not being fetched and there's an error nor base wearables", () => {
    beforeEach(() => {
      state = {
        ...state,
        editor: {
          ...state.editor,
          loading: [],
          baseWearables: [],
          fetchingBaseWearablesError: 'someError'
        }
      }
    })

    it('should return false', () => {
      expect(isLoadingBaseWearables(state)).toBe(false)
    })
  })

  describe("and the base wearables are not being fetched and base wearables already exist and there's no error", () => {
    beforeEach(() => {
      state = {
        ...state,
        editor: {
          ...state.editor,
          loading: [],
          baseWearables: [wearable],
          fetchingBaseWearablesError: null
        }
      }
    })

    it('should return false', () => {
      expect(isLoadingBaseWearables(state)).toBe(false)
    })
  })
})

describe('when getting the selected base wearables', () => {
  beforeEach(() => {
    state = {
      ...state,
      editor: {
        ...state.editor,
        selectedBaseWearablesByBodyShape: {
          [BodyShape.FEMALE]: {
            [WearableCategory.HAIR]: wearable,
            [WearableCategory.FACIAL_HAIR]: null,
            [WearableCategory.UPPER_BODY]: wearable,
            [WearableCategory.LOWER_BODY]: wearable
          },
          [BodyShape.MALE]: {
            [WearableCategory.HAIR]: wearable,
            [WearableCategory.FACIAL_HAIR]: wearable,
            [WearableCategory.UPPER_BODY]: wearable,
            [WearableCategory.LOWER_BODY]: wearable
          }
        }
      }
    }
  })

  it('should return the selected base wearables', () => {
    expect(getSelectedBaseWearablesByBodyShape(state)).toEqual(state.editor.selectedBaseWearablesByBodyShape)
  })
})

describe('when getting the fetching base wearable error', () => {
  beforeEach(() => {
    state = {
      ...state,
      editor: {
        ...state.editor,
        fetchingBaseWearablesError: 'someError'
      }
    }
  })

  it('should return the fetching base wearable error', () => {
    expect(getFetchingBaseWearablesError(state)).toEqual('someError')
  })
})
