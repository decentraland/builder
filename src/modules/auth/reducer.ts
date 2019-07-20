import { loadingReducer } from 'decentraland-dapps/dist/modules/loading/reducer'

import { AuthRequestAction, AuthSuccessAction, AuthFailureAction, AUTH_REQUEST, AUTH_SUCCESS, AUTH_FAILURE } from './actions'
import { AuthState } from './types'

export const INITIAL_STATE: AuthState = {
  loading: [],
  data: null,
  error: null
}

export type AuthReducerAction = AuthRequestAction | AuthSuccessAction | AuthFailureAction

export function authReducer(state: AuthState = INITIAL_STATE, action: AuthReducerAction) {
  switch (action.type) {
    case AUTH_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case AUTH_SUCCESS: {
      return {
        ...state,
        data: action.payload,
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }
    case AUTH_FAILURE: {
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
