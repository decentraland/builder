import { Land } from './types'
import { LoadingState, loadingReducer } from 'decentraland-dapps/dist/modules/loading/reducer'
import {
  FetchLandRequestAction,
  FetchLandSuccessAction,
  FetchLandFailureAction,
  FETCH_LAND_REQUEST,
  FETCH_LAND_SUCCESS,
  FETCH_LAND_FAILURE
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

export type LandReducerAction = FetchLandRequestAction | FetchLandSuccessAction | FetchLandFailureAction

export function landReducer(state: LandState = INITIAL_STATE, action: LandReducerAction) {
  switch (action.type) {
    case FETCH_LAND_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case FETCH_LAND_SUCCESS: {
      const { address, land } = action.payload
      return {
        data: {
          ...state.data,
          [address]: land
        },
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }
    case FETCH_LAND_FAILURE: {
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
