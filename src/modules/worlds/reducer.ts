import { LoadingState, loadingReducer } from 'decentraland-dapps/dist/modules/loading/reducer'
import {
  FetchWalletWorldsStatsRequestAction,
  FetchWalletWorldsStatsFailureAction,
  FetchWalletWorldsStatsSuccessAction,
  FETCH_WORLDS_WALLET_STATS_REQUEST,
  FETCH_WORLDS_WALLET_STATS_SUCCESS,
  FETCH_WORLDS_WALLET_STATS_FAILURE
} from './actions'
import { WorldsWalletStats } from 'lib/api/worlds'

export type WorldsState = {
  // TODO: Find a use for the data object when there is something more relevant as the core data for the worlds module.
  data: Record<string, any>
  walletStats: Record<string, WorldsWalletStats>
  loading: LoadingState
  error: string | null
}

export const INITIAL_STATE: WorldsState = {
  data: {},
  walletStats: {},
  loading: [],
  error: null
}

export type WorldsReducerAction =
  | FetchWalletWorldsStatsRequestAction
  | FetchWalletWorldsStatsSuccessAction
  | FetchWalletWorldsStatsFailureAction

export function worldsReducer(state: WorldsState = INITIAL_STATE, action: WorldsReducerAction): WorldsState {
  switch (action.type) {
    case FETCH_WORLDS_WALLET_STATS_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }
    case FETCH_WORLDS_WALLET_STATS_FAILURE: {
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
    default:
      return state
  }
}
