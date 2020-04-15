import { loadingReducer } from 'decentraland-dapps/dist/modules/loading/reducer'

import {
  AuthRequestLegacyAction,
  AuthSuccessLegacyAction,
  AuthFailureLegacyAction,
  LEGACY_AUTH_REQUEST,
  LEGACY_AUTH_SUCCESS,
  LEGACY_AUTH_FAILURE
} from './actions'
import { AuthState } from './types'

export const INITIAL_STATE: AuthState = {
  loading: [],
  data: null,
  error: null
}

export type AuthReducerAction = AuthRequestLegacyAction | AuthSuccessLegacyAction | AuthFailureLegacyAction

export function authReducer(state: AuthState = INITIAL_STATE, action: AuthReducerAction) {
  switch (action.type) {
    case LEGACY_AUTH_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case LEGACY_AUTH_SUCCESS: {
      return {
        ...state,
        data: action.payload.data,
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }
    case LEGACY_AUTH_FAILURE: {
      return {
        ...state,
        data: null,
        loading: loadingReducer(state.loading, action),
        error: action.payload.error
      }
    }
    default: {
      return state
    }
  }
}
