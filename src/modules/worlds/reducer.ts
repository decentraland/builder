import { LoadingState, loadingReducer } from 'decentraland-dapps/dist/modules/loading/reducer'
import {
  FetchWalletWorldsStatsRequestAction,
  FetchWalletWorldsStatsFailureAction,
  FetchWalletWorldsStatsSuccessAction,
  GetWorldPermissionsSuccessAction,
  GetWorldPermissionsRequestAction,
  GetWorldPermissionsFailureAction,
  PostWorldPermissionsRequestAction,
  PostWorldPermissionsSuccessAction,
  PostWorldPermissionsFailureAction,
  PutWorldPermissionsRequestAction,
  PutWorldPermissionsSuccessAction,
  DeleteWorldPermissionsFailureAction,
  DeleteWorldPermissionsRequestAction,
  DeleteWorldPermissionsSuccessAction,
  PutWorldPermissionsFailureAction,
  FETCH_WORLDS_WALLET_STATS_REQUEST,
  FETCH_WORLDS_WALLET_STATS_SUCCESS,
  FETCH_WORLDS_WALLET_STATS_FAILURE,
  DELETE_WORLD_PERMISSIONS_FAILURE,
  DELETE_WORLD_PERMISSIONS_REQUEST,
  DELETE_WORLD_PERMISSIONS_SUCCESS,
  GET_WORLD_PERMISSIONS_FAILURE,
  GET_WORLD_PERMISSIONS_REQUEST,
  GET_WORLD_PERMISSIONS_SUCCESS,
  POST_WORLD_PERMISSIONS_FAILURE,
  POST_WORLD_PERMISSIONS_REQUEST,
  POST_WORLD_PERMISSIONS_SUCCESS,
  PUT_WORLD_PERMISSIONS_FAILURE,
  PUT_WORLD_PERMISSIONS_REQUEST,
  PUT_WORLD_PERMISSIONS_SUCCESS
} from './actions'
import { AllowListPermissionSetting, WorldPermissionType, WorldPermissions, WorldsWalletStats } from 'lib/api/worlds'
import { Avatar } from '@dcl/schemas/dist/platform/profile/avatar'

export type WorldsState = {
  // TODO: Find a use for the data object when there is something more relevant as the core data for the worlds module.
  data: Record<string, unknown>
  walletStats: Record<string, WorldsWalletStats>
  worldsPermissions: Record<string, WorldPermissions>
  profiles: Record<string, Avatar>
  loading: LoadingState
  error: string | null
}

export const INITIAL_STATE: WorldsState = {
  data: {},
  walletStats: {},
  worldsPermissions: {},
  profiles: {},
  loading: [],
  error: null
}

export type WorldsReducerAction =
  | FetchWalletWorldsStatsRequestAction
  | FetchWalletWorldsStatsSuccessAction
  | FetchWalletWorldsStatsFailureAction
  | GetWorldPermissionsRequestAction
  | GetWorldPermissionsSuccessAction
  | GetWorldPermissionsFailureAction
  | PostWorldPermissionsRequestAction
  | PostWorldPermissionsSuccessAction
  | PostWorldPermissionsFailureAction
  | PutWorldPermissionsRequestAction
  | PutWorldPermissionsSuccessAction
  | PutWorldPermissionsFailureAction
  | DeleteWorldPermissionsRequestAction
  | DeleteWorldPermissionsSuccessAction
  | DeleteWorldPermissionsFailureAction

export function worldsReducer(state: WorldsState = INITIAL_STATE, action: WorldsReducerAction): WorldsState {
  switch (action.type) {
    case FETCH_WORLDS_WALLET_STATS_REQUEST:
    case GET_WORLD_PERMISSIONS_REQUEST:
    case POST_WORLD_PERMISSIONS_REQUEST:
    case PUT_WORLD_PERMISSIONS_REQUEST:
    case DELETE_WORLD_PERMISSIONS_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }
    case FETCH_WORLDS_WALLET_STATS_FAILURE:
    case GET_WORLD_PERMISSIONS_FAILURE:
    case POST_WORLD_PERMISSIONS_FAILURE:
    case PUT_WORLD_PERMISSIONS_FAILURE:
    case DELETE_WORLD_PERMISSIONS_FAILURE: {
      const { error } = action.payload

      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error
      }
    }
    case FETCH_WORLDS_WALLET_STATS_SUCCESS: {
      const { address, stats } = action.payload

      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        walletStats: {
          ...state.walletStats,
          [address]: stats
        }
      }
    }
    case GET_WORLD_PERMISSIONS_SUCCESS: {
      const { worldName, permissions } = action.payload
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        worldsPermissions: {
          ...state.worldsPermissions,
          [worldName]: permissions
        }
      }
    }
    case POST_WORLD_PERMISSIONS_SUCCESS: {
      const { worldName, worldPermissionNames, worldPermissionType } = action.payload
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        worldsPermissions: {
          ...state.worldsPermissions,
          [worldName]: {
            ...state.worldsPermissions[worldName],
            [worldPermissionNames]: {
              type: worldPermissionType,
              ...(worldPermissionType === WorldPermissionType.AllowList && { wallets: [] })
            }
          }
        }
      }
    }
    case PUT_WORLD_PERMISSIONS_SUCCESS: {
      const { worldName, worldPermissionNames, worldPermissionType, newData } = action.payload

      let worldPermissions: WorldPermissions = state.worldsPermissions[worldName]

      let newArrayWallet: string[] = []
      if ((worldPermissions[worldPermissionNames] as AllowListPermissionSetting).wallets) {
        newArrayWallet = (worldPermissions[worldPermissionNames] as AllowListPermissionSetting).wallets
      }
      newArrayWallet.push(newData)
      worldPermissions = {
        ...worldPermissions,
        [worldPermissionNames]: {
          type: worldPermissionType,
          wallets: newArrayWallet
        }
      }

      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        worldsPermissions: {
          ...state.worldsPermissions,
          [worldName]: {
            ...state.worldsPermissions[worldName],
            ...worldPermissions
          }
        }
      }
    }
    case DELETE_WORLD_PERMISSIONS_SUCCESS: {
      const { worldName, worldPermissionNames, worldPermissionType, address } = action.payload

      let worldPermissions: WorldPermissions = state.worldsPermissions[worldName]

      const newArrayWallet: string[] = (worldPermissions[worldPermissionNames] as AllowListPermissionSetting).wallets.filter(
        wallet => wallet !== address
      )

      worldPermissions = {
        ...worldPermissions,
        [worldPermissionNames]: {
          type: worldPermissionType,
          wallets: newArrayWallet
        }
      }

      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        worldsPermissions: {
          ...state.worldsPermissions,
          [worldName]: {
            ...worldPermissions
          }
        }
      }
    }
    default:
      return state
  }
}
