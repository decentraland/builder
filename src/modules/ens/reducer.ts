import { LoadingState, loadingReducer } from 'decentraland-dapps/dist/modules/loading/reducer'
import { FetchTransactionSuccessAction, FETCH_TRANSACTION_SUCCESS } from 'decentraland-dapps/dist/modules/transaction/actions'
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
import { ENS, ENSError } from './types'

export type ENSState = {
  data: Record<string, ENS>
  loading: LoadingState
  error: ENSError | null
}

const INITIAL_STATE: ENSState = {
  data: {},
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
  | FetchTransactionSuccessAction

export function ensReducer(state: ENSState = INITIAL_STATE, action: ENSReducerAction): ENSState {
  switch (action.type) {
    case FETCH_DOMAIN_LIST_REQUEST:
    case FETCH_ENS_REQUEST:
    case SET_ENS_CONTENT_REQUEST:
    case SET_ENS_RESOLVER_REQUEST:
    case SET_ENS_CONTENT_SUCCESS:
    case SET_ENS_RESOLVER_SUCCESS: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case FETCH_DOMAIN_LIST_SUCCESS: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        data: {
          ...state.data,
          ...action.payload.ensList.reduce(
            (obj, ens) => {
              obj[ens.subdomain] = { ...obj[ens.subdomain], ...ens }
              return obj
            },
            { ...state.data }
          )
        }
      }
    }
    case FETCH_ENS_SUCCESS: {
      const { ens } = action.payload
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        data: {
          ...state.data,
          [ens.subdomain]: {
            ...ens
          }
        }
      }
    }
    case SET_ENS_RESOLVER_FAILURE:
    case SET_ENS_CONTENT_FAILURE:
    case FETCH_ENS_FAILURE:
    case FETCH_DOMAIN_LIST_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: { ...action.payload.error }
      }
    }
    case FETCH_TRANSACTION_SUCCESS: {
      const transaction = action.payload.transaction

      switch (transaction.actionType) {
        case SET_ENS_RESOLVER_SUCCESS: {
          const { ens, resolver } = transaction.payload
          const { subdomain } = ens
          return {
            ...state,
            loading: loadingReducer(state.loading, action),
            data: {
              ...state.data,
              [subdomain]: {
                ...state.data[subdomain],
                resolver
              }
            }
          }
        }
        case SET_ENS_CONTENT_SUCCESS: {
          const { ens, content, land } = transaction.payload
          const { subdomain } = ens
          return {
            ...state,
            loading: loadingReducer(state.loading, action),
            data: {
              ...state.data,
              [subdomain]: {
                ...state.data[subdomain],
                content,
                landId: land ? land.id : ''
              }
            }
          }
        }
        default:
          return state
      }
    }
    default:
      return state
  }
}
