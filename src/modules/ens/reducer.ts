import { LoadingState, loadingReducer } from 'decentraland-dapps/dist/modules/loading/reducer'
import { FetchTransactionSuccessAction, FETCH_TRANSACTION_SUCCESS } from 'decentraland-dapps/dist/modules/transaction/actions'
import {
  FetchENSListRequestAction,
  FetchENSListSuccessAction,
  FetchENSListFailureAction,
  FETCH_ENS_LIST_REQUEST,
  FETCH_ENS_LIST_SUCCESS,
  FETCH_ENS_LIST_FAILURE,
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
  SET_ENS_RESOLVER_FAILURE,
  SET_ALIAS_SUCCESS,
  SET_ALIAS_FAILURE,
  SET_ALIAS_REQUEST,
  SetAliasSuccessAction,
  SetAliasFailureAction,
  SetAliasRequestAction,
  CLAIM_NAME_REQUEST,
  ClaimNameRequestAction,
  ClaimNameFailureAction,
  ClaimNameSuccessAction,
  CLAIM_NAME_FAILURE,
  CLAIM_NAME_SUCCESS,
  ALLOW_CLAIM_MANA_REQUEST,
  ALLOW_CLAIM_MANA_FAILURE,
  ALLOW_CLAIM_MANA_SUCCESS,
  AllowClaimManaRequestAction,
  AllowClaimManaSuccessAction,
  AllowClaimManaFailureAction
} from './actions'
import { ENS, ENSError, Authorization } from './types'

export type ENSState = {
  data: Record<string, ENS>
  authorizations: Record<string, Authorization>
  loading: LoadingState
  error: ENSError | null
}

const INITIAL_STATE: ENSState = {
  data: {},
  authorizations: {},
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
  | FetchENSListRequestAction
  | FetchENSListSuccessAction
  | FetchENSListFailureAction
  | FetchTransactionSuccessAction
  | SetAliasSuccessAction
  | SetAliasFailureAction
  | SetAliasRequestAction
  | ClaimNameRequestAction
  | ClaimNameFailureAction
  | ClaimNameSuccessAction
  | AllowClaimManaRequestAction
  | AllowClaimManaSuccessAction
  | AllowClaimManaFailureAction

export function ensReducer(state: ENSState = INITIAL_STATE, action: ENSReducerAction): ENSState {
  switch (action.type) {
    case CLAIM_NAME_REQUEST:
    case SET_ALIAS_REQUEST:
    case SET_ALIAS_SUCCESS:
    case FETCH_ENS_LIST_REQUEST:
    case FETCH_ENS_REQUEST:
    case SET_ENS_CONTENT_REQUEST:
    case SET_ENS_RESOLVER_REQUEST:
    case SET_ENS_CONTENT_SUCCESS:
    case SET_ENS_RESOLVER_SUCCESS:
    case ALLOW_CLAIM_MANA_REQUEST:
    case ALLOW_CLAIM_MANA_SUCCESS: {
      return {
        ...state,
        error: null,
        loading: loadingReducer(state.loading, action)
      }
    }
    case FETCH_ENS_LIST_SUCCESS: {
      const { ensList, authorization, address } = action.payload
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        data: {
          ...state.data,
          ...ensList.reduce(
            (obj, ens) => {
              obj[ens.subdomain] = { ...obj[ens.subdomain], ...ens }
              return obj
            },
            { ...state.data }
          )
        },
        authorizations: {
          ...state.authorizations,
          [address]: {
            ...authorization
          }
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
    case CLAIM_NAME_SUCCESS: {
      const { ens } = action.payload
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        data: {
          ...state.data,
          [ens.subdomain]: {
            ...state.data[ens.subdomain],
            ...ens
          }
        }
      }
    }
    case SET_ALIAS_FAILURE:
    case CLAIM_NAME_FAILURE:
    case SET_ENS_RESOLVER_FAILURE:
    case SET_ENS_CONTENT_FAILURE:
    case FETCH_ENS_FAILURE:
    case FETCH_ENS_LIST_FAILURE:
    case ALLOW_CLAIM_MANA_FAILURE: {
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
        case ALLOW_CLAIM_MANA_SUCCESS: {
          const { allowance, address } = transaction.payload
          return {
            ...state,
            authorizations: {
              ...state.authorizations,
              [address]: {
                ...state.authorizations[address],
                allowance
              }
            },
            loading: loadingReducer(state.loading, action)
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
