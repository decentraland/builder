import { RouterState } from 'connected-react-router'
import { WearableBodyShape, WearableCategory } from '@dcl/schemas'
import { RootState } from 'modules/common/types'
import { ItemState } from 'modules/item/reducer'
import { Item } from 'modules/item/types'
import { wearable } from 'specs/editor'
import { FETCH_BASE_WEARABLES_REQUEST } from './actions'
import { INITIAL_STATE } from './reducer'
import { getFetchingBaseWearablesError, getSelectedBaseWearablesByBodyShape, isLoadingBaseWearables, getVisibleItems } from './selectors'

let state: RootState
const routerState: RouterState = {
  action: 'PUSH',
  location: {
    query: {},
    pathname: '',
    state: '',
    hash: '',
    search: ''
  }
}

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
          [WearableBodyShape.FEMALE]: {
            [WearableCategory.HAIR]: wearable,
            [WearableCategory.FACIAL_HAIR]: null,
            [WearableCategory.UPPER_BODY]: wearable,
            [WearableCategory.LOWER_BODY]: wearable
          },
          [WearableBodyShape.MALE]: {
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

describe('when getting the visible items', () => {
  beforeEach(() => {
    state = {
      ...state,
      router: routerState,
      item: ({
        data: {
          someId: { id: 'someId' } as Item,
          otherId: { id: 'otherId' } as Item
        }
      } as unknown) as ItemState,
      editor: {
        ...state.editor,
        visibleItemIds: ['someId', 'otherId']
      }
    }
  })
  it('should return a list of all the visible items', () => {
    expect(getVisibleItems(state)).toEqual([{ id: 'someId' }, { id: 'otherId' }])
  })
  describe('when there are ids that are not present in the data record', () => {
    beforeEach(() => {
      state = {
        ...state,
        router: routerState,
        item: ({
          data: {
            someId: { id: 'someId' } as Item
          }
        } as unknown) as ItemState,
        editor: {
          ...state.editor,
          visibleItemIds: ['someId', 'doesNotExist']
        }
      }
    })
    it('should return only the items that exist in the data record regardless of the visible ids', () => {
      expect(getVisibleItems(state)).toEqual([{ id: 'someId' }])
    })
  })
  describe('when the curator is reviewing a collection', () => {
    beforeEach(() => {
      state = {
        ...state,
        router: {
          ...routerState,
          location: {
            ...routerState.location,
            search: '?reviewing=true&collection=aCollection'
          }
        },
        item: ({
          data: {
            someId: { id: 'someId', collectionId: 'aCollection' } as Item,
            otherId: { id: 'otherId', collectionId: 'otherCollection' } as Item
          }
        } as unknown) as ItemState,
        editor: {
          ...state.editor,
          visibleItemIds: ['someId', 'otherId']
        }
      }
    })
    it('should return only items of that collection regardless of the ids in the visible items list', () => {
      expect(getVisibleItems(state)).toEqual([{ id: 'someId', collectionId: 'aCollection' }])
    })
  })
})
