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
  RECLAIM_NAME_SUCCESS,
  RECLAIM_NAME_FAILURE,
  RECLAIM_NAME_REQUEST,
  ReclaimNameRequestAction,
  ReclaimNameSuccessAction,
  ReclaimNameFailureAction,
  FETCH_ENS_WORLD_STATUS_REQUEST,
  FETCH_ENS_WORLD_STATUS_SUCCESS,
  FETCH_ENS_WORLD_STATUS_FAILURE,
  FetchENSWorldStatusRequestAction,
  FetchENSWorldStatusSuccessAction,
  FetchENSWorldStatusFailureAction,
  FETCH_EXTERNAL_NAMES_FAILURE,
  FETCH_EXTERNAL_NAMES_REQUEST,
  FetchExternalNamesRequestAction,
  FetchExternalNamesSuccessAction,
  FetchExternalNamesFailureAction,
  FETCH_EXTERNAL_NAMES_SUCCESS,
  SET_ENS_ADDRESS_REQUEST,
  SET_ENS_ADDRESS_SUCCESS,
  SET_ENS_ADDRESS_FAILURE,
  SetENSAddressRequestAction,
  SetENSAddressFailureAction,
  SetENSAddressSuccessAction,
  setENSAddressSuccess,
  CLEAR_ENS_ERRORS,
  ClearENSErrorsAction,
  FETCH_CONTRIBUTABLE_NAMES_SUCCESS,
  FetchContributableNamesFailureAction,
  FetchContributableNamesRequestAction,
  FetchContributableNamesSuccessAction,
  FETCH_CONTRIBUTABLE_NAMES_REQUEST,
  FETCH_CONTRIBUTABLE_NAMES_FAILURE
} from './actions'
import { ENS, ENSError } from './types'
import { isExternalName } from './utils'

export type ENSState = {
  data: Record<string, ENS>
  externalNames: Record<string, ENS>
  contributableNames: Record<string, ENS>
  loading: LoadingState
  error: ENSError | null
  contributableNamesError: ENSError | null
  total: number
}

export const INITIAL_STATE: ENSState = {
  data: {},
  externalNames: {},
  contributableNames: {},
  loading: [],
  error: null,
  contributableNamesError: null,
  total: 0
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
  | ReclaimNameRequestAction
  | ReclaimNameSuccessAction
  | ReclaimNameFailureAction
  | FetchENSWorldStatusRequestAction
  | FetchENSWorldStatusSuccessAction
  | FetchENSWorldStatusFailureAction
  | FetchExternalNamesRequestAction
  | FetchExternalNamesSuccessAction
  | FetchExternalNamesFailureAction
  | SetENSAddressRequestAction
  | SetENSAddressSuccessAction
  | SetENSAddressFailureAction
  | ClearENSErrorsAction
  | FetchContributableNamesFailureAction
  | FetchContributableNamesRequestAction
  | FetchContributableNamesSuccessAction

export function ensReducer(state: ENSState = INITIAL_STATE, action: ENSReducerAction): ENSState {
  switch (action.type) {
    case RECLAIM_NAME_REQUEST:
    case FETCH_ENS_LIST_REQUEST:
    case FETCH_ENS_REQUEST:
    case FETCH_ENS_WORLD_STATUS_REQUEST:
    case SET_ENS_CONTENT_REQUEST:
    case SET_ENS_RESOLVER_REQUEST:
    case SET_ENS_CONTENT_SUCCESS:
    case SET_ENS_RESOLVER_SUCCESS:
    case FETCH_EXTERNAL_NAMES_REQUEST:
    case SET_ENS_ADDRESS_REQUEST: {
      return {
        ...state,
        error: null,
        loading: loadingReducer(state.loading, action)
      }
    }
    case FETCH_CONTRIBUTABLE_NAMES_REQUEST: {
      return {
        ...state,
        contributableNamesError: null,
        loading: loadingReducer(state.loading, action)
      }
    }
    case FETCH_ENS_LIST_SUCCESS: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        total: action.payload.total,
        data: action.payload.ensList.reduce(
          (obj, ens) => {
            obj[ens.subdomain] = ens
            return obj
          },
          {} as Record<string, ENS>
        )
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
    case FETCH_ENS_WORLD_STATUS_SUCCESS: {
      const { ens, isContributableName } = action.payload

      let update: Pick<ENSState, 'data'> | Pick<ENSState, 'externalNames'> | Pick<ENSState, 'contributableNames'>

      if (isContributableName) {
        update = {
          contributableNames: {
            ...state.contributableNames,
            [ens.subdomain]: {
              ...ens
            }
          }
        }
      } else if (isExternalName(ens.subdomain)) {
        update = {
          externalNames: {
            ...state.externalNames,
            [ens.subdomain]: {
              ...ens
            }
          }
        }
      } else {
        update = {
          data: {
            ...state.data,
            [ens.subdomain]: {
              ...ens
            }
          }
        }
      }

      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        ...update
      }
    }
    case RECLAIM_NAME_SUCCESS: {
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
    case FETCH_EXTERNAL_NAMES_SUCCESS: {
      const { names } = action.payload

      const externalNamesByDomain = names.reduce((obj, ens) => {
        obj[ens.subdomain] = ens
        return obj
      }, {} as Record<string, ENS>)

      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        externalNames: {
          ...state.externalNames,
          ...externalNamesByDomain
        }
      }
    }
    case FETCH_CONTRIBUTABLE_NAMES_SUCCESS: {
      const { names } = action.payload
      const contributableNamesByDomain = names.reduce((obj, ens) => {
        obj[ens.subdomain] = ens
        return obj
      }, {} as Record<string, ENS>)

      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        contributableNames: {
          ...state.contributableNames,
          ...contributableNamesByDomain
        }
      }
    }
    case RECLAIM_NAME_FAILURE:
    case SET_ENS_RESOLVER_FAILURE:
    case SET_ENS_CONTENT_FAILURE:
    case FETCH_ENS_FAILURE:
    case FETCH_ENS_WORLD_STATUS_FAILURE:
    case FETCH_ENS_LIST_FAILURE:
    case FETCH_EXTERNAL_NAMES_FAILURE:
    case SET_ENS_ADDRESS_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: { ...action.payload.error }
      }
    }
    case FETCH_CONTRIBUTABLE_NAMES_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        contributableNamesError: { ...action.payload.error }
      }
    }
    case CLEAR_ENS_ERRORS: {
      return {
        ...state,
        error: null
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
        case SET_ENS_ADDRESS_SUCCESS: {
          const { ens, address, chainId, txHash } = transaction.payload
          return {
            ...state,
            loading: loadingReducer(state.loading, setENSAddressSuccess(ens, address, chainId, txHash)),
            error: null,
            data: {
              ...state.data,
              [ens.subdomain]: {
                ...state.data[ens.subdomain],
                ensAddressRecord: address
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
