import { ENSData } from './types'
import { LoadingState, loadingReducer } from 'decentraland-dapps/dist/modules/loading/reducer'
import {
  FetchDomainListRequestAction,
  FetchDomainListSuccessAction,
  FetchDomainListFailureAction,
  FETCH_DOMAIN_LIST_REQUEST,
  FETCH_DOMAIN_LIST_SUCCESS,
  FETCH_DOMAIN_LIST_FAILURE,
  FetchENSRequestAction,
  FetchENSSuccessAction,
  FetchENSFailureAction,
  FETCH_ENS_REQUEST,
  FETCH_ENS_SUCCESS,
  FETCH_ENS_FAILURE,
  SetENSContentRequestAction,
  SetENSContentSuccessAction,
  SetENSContentFailureAction,
  SET_ENS_CONTENT_REQUEST,
  SET_ENS_CONTENT_SUCCESS,
  SET_ENS_CONTENT_FAILURE,
  SetENSResolverRequestAction,
  SetENSResolverSuccessAction,
  SetENSResolverFailureAction,
  SET_ENS_RESOLVER_REQUEST,
  SET_ENS_RESOLVER_SUCCESS,
  SET_ENS_RESOLVER_FAILURE
} from './actions'

export type ENSError = {
  code: number
  message: string
  origin: string
}
export type ENSState = {
  data: Record<string, ENSData>
  subdomainList: string[]
  loading: LoadingState
  error: ENSError | null
}

const INITIAL_STATE: ENSState = {
  data: {},
  subdomainList: [],
  loading: [],
  error: null
}

export type ENSReducerAction =
  | FetchENSRequestAction
  | FetchENSSuccessAction
  | FetchENSFailureAction
  | SetENSContentRequestAction
  | SetENSContentSuccessAction
  | SetENSContentFailureAction
  | SetENSResolverRequestAction
  | SetENSResolverSuccessAction
  | SetENSResolverFailureAction
  | FetchDomainListRequestAction
  | FetchDomainListSuccessAction
  | FetchDomainListFailureAction

export function ensReducer(state: ENSState = INITIAL_STATE, action: ENSReducerAction): ENSState {
  switch (action.type) {
    case FETCH_DOMAIN_LIST_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case FETCH_DOMAIN_LIST_SUCCESS: {
      const { data } = action.payload
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        subdomainList: data
      }
    }
    case FETCH_ENS_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case FETCH_ENS_SUCCESS: {
      const { ens, data } = action.payload
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        data: {
          ...state.data,
          [ens]: data
        }
      }
    }
    case SET_ENS_CONTENT_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }
    case SET_ENS_CONTENT_SUCCESS: {
      const { ens, data } = action.payload
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null,
        data: {
          ...state.data,
          [ens]: data
        }
      }
    }
    case SET_ENS_RESOLVER_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }
    case SET_ENS_RESOLVER_SUCCESS: {
      const { ens, data } = action.payload
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null,
        data: {
          ...state.data,
          [ens]: data
        }
      }
    }
    case SET_ENS_RESOLVER_FAILURE:
    case SET_ENS_CONTENT_FAILURE:
    case FETCH_ENS_FAILURE:
    case FETCH_DOMAIN_LIST_FAILURE: {
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
