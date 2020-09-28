import { ENSData } from './types'
import { LoadingState, loadingReducer } from 'decentraland-dapps/dist/modules/loading/reducer'
import {
  GetENSRequestAction,
  GetENSSuccessAction,
  GetENSFailureAction,
  GET_ENS_REQUEST,
  GET_ENS_SUCCESS,
  GET_ENS_FAILURE,
  SetENSRequestAction,
  SetENSSuccessAction,
  SetENSFailureAction,
  SET_ENS_REQUEST,
  SET_ENS_SUCCESS,
  SET_ENS_FAILURE,
} from './actions'

export type ENSState = {
  data: Record<string, ENSData>
  loading: LoadingState
  error: string | null
}

const INITIAL_STATE: ENSState = {
  data: {},
  loading: [],
  error: null,
}

export type ENSReducerAction = GetENSRequestAction | GetENSSuccessAction | GetENSFailureAction |
                                  SetENSRequestAction | SetENSSuccessAction | SetENSFailureAction

export function ensReducer(state: ENSState = INITIAL_STATE, action: ENSReducerAction): ENSState {
  switch (action.type) {
    case GET_ENS_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
      }
    }
    case GET_ENS_SUCCESS: {
      const { ens, data } = action.payload
      
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        data: {
          [ens] : data
        }
      }
    }
    case GET_ENS_FAILURE: {
      const { error } = action.payload
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error
      }
    }
    case SET_ENS_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
      }
    }
    case SET_ENS_SUCCESS: {
      const { ens, data } = action.payload
      
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        data: {
          ...state.data,
          [ens] : data
        }
      }
    }
    case SET_ENS_FAILURE: {
      const { error } = action.payload
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error
      }
    }

    default:
      return state
  }
}
