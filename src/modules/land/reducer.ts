import { Land } from './types'
import { LoadingState, loadingReducer } from 'decentraland-dapps/dist/modules/loading/reducer'
import {
  FetchLandsRequestAction,
  FetchLandsSuccessAction,
  FetchLandsFailureAction,
  FETCH_LANDS_REQUEST,
  FETCH_LANDS_SUCCESS,
  FETCH_LANDS_FAILURE
} from './actions'

export type LandState = {
  data: Record<string, Land[]>
  loading: LoadingState
  error: string | null
}

const INITIAL_STATE: LandState = {
  data: {},
  loading: [],
  error: null
}

export type LandReducerAction = FetchLandsRequestAction | FetchLandsSuccessAction | FetchLandsFailureAction

export function landReducer(state: LandState = INITIAL_STATE, action: LandReducerAction) {
  switch (action.type) {
    case FETCH_LANDS_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case FETCH_LANDS_SUCCESS: {
      const { address, lands: land } = action.payload
      return {
        data: {
          ...state.data,
          [address]: land
        },
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }
    case FETCH_LANDS_FAILURE: {
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
