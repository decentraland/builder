import { Name } from './types'
import { LoadingState, loadingReducer } from 'decentraland-dapps/dist/modules/loading/reducer'
import {
  FetchNamesRequestAction,
  FetchNamesSuccessAction,
  FetchNamesFailureAction,
  FETCH_NAMES_REQUEST,
  FETCH_NAMES_SUCCESS,
  FETCH_NAMES_FAILURE
} from './actions'

export type NamesState = {
  data: Record<string, Name[]>
  loading: LoadingState
  error: string | null
}

const INITIAL_STATE: NamesState = {
  data: {},
  loading: [],
  error: null
}

export type NamesReducerAction = FetchNamesRequestAction | FetchNamesSuccessAction | FetchNamesFailureAction

export function namesReducer(state: NamesState = INITIAL_STATE, action: NamesReducerAction) {
  switch (action.type) {
    case FETCH_NAMES_REQUEST: {
      return {
        ...state,
        authorizations: [],
        loading: loadingReducer(state.loading, action)
      }
    }
    case FETCH_NAMES_SUCCESS: {
      const { address, names } = action.payload
      return {
        data: {
          ...state.data,
          [address]: names
        },
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }
    case FETCH_NAMES_FAILURE: {
      const { error } = action.payload
      return {
        ...state,
        error
      }
    }
    default:
      return state
  }
}
