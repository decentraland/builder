import { LoadingState, loadingReducer } from 'decentraland-dapps/dist/modules/loading/reducer'
import {
  FetchLandsRequestAction,
  FetchLandsSuccessAction,
  FetchLandsFailureAction,
  FETCH_LANDS_REQUEST,
  FETCH_LANDS_SUCCESS,
  FETCH_LANDS_FAILURE
} from './actions'
import { Land, Authorization } from './types'

export type LandState = {
  data: Record<string, Land[]>
  authorizations: Authorization[]
  loading: LoadingState
  error: string | null
}

const INITIAL_STATE: LandState = {
  data: {},
  authorizations: [],
  loading: [],
  error: null
}

export type LandReducerAction = FetchLandsRequestAction | FetchLandsSuccessAction | FetchLandsFailureAction

export function landReducer(state: LandState = INITIAL_STATE, action: LandReducerAction) {
  switch (action.type) {
    case FETCH_LANDS_REQUEST: {
      return {
        ...state,
        authorizations: [],
        loading: loadingReducer(state.loading, action)
      }
    }
    case FETCH_LANDS_SUCCESS: {
      const { address, lands, authorizations } = action.payload
      return {
        data: {
          ...state.data,
          [address]: lands
        },
        authorizations,
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
