import { AuthIdentity } from 'dcl-crypto'
import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import {
  GenerateIdentityRequestAction,
  GenerateIdentitySuccessAction,
  GenerateIdentityFailureAction,
  GENERATE_IDENTITY_REQUEST,
  GENERATE_IDENTITY_SUCCESS,
  GENERATE_IDENTITY_FAILURE,
  DestroyIdentityAction,
  DESTROY_IDENTITY
} from './actions'

export type IdentityState = {
  data: Record<string, AuthIdentity>
  loading: LoadingState
  error: string | null
}

export const INITIAL_STATE: IdentityState = {
  data: {},
  loading: [],
  error: null
}

export type IdentityReducerAction =
  | GenerateIdentityRequestAction
  | GenerateIdentitySuccessAction
  | GenerateIdentityFailureAction
  | DestroyIdentityAction

export function identityReducer(state: IdentityState = INITIAL_STATE, action: IdentityReducerAction): IdentityState {
  switch (action.type) {
    case GENERATE_IDENTITY_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case GENERATE_IDENTITY_SUCCESS: {
      const { address, identity } = action.payload
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null,
        data: {
          ...state.data,
          [address]: identity
        }
      }
    }
    case GENERATE_IDENTITY_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: action.payload.error
      }
    }
    case DESTROY_IDENTITY: {
      const { address } = action.payload
      const data = { ...state.data }
      delete data[address]
      return {
        ...state,
        data
      }
    }
    default:
      return state
  }
}
