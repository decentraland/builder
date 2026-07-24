import { LoadingState, loadingReducer } from 'decentraland-dapps/dist/modules/loading/reducer'
import { ShopCreditsBalance } from 'lib/api/credits'
import {
  FetchShopCreditsBalanceRequestAction,
  FetchShopCreditsBalanceSuccessAction,
  FetchShopCreditsBalanceFailureAction,
  FETCH_SHOP_CREDITS_BALANCE_REQUEST,
  FETCH_SHOP_CREDITS_BALANCE_SUCCESS,
  FETCH_SHOP_CREDITS_BALANCE_FAILURE
} from './actions'

export type ShopCreditsState = {
  balances: Record<string, ShopCreditsBalance>
  loading: LoadingState
  error: string | null
}

export const INITIAL_STATE: ShopCreditsState = {
  balances: {},
  loading: [],
  error: null
}

export type ShopCreditsReducerAction =
  | FetchShopCreditsBalanceRequestAction
  | FetchShopCreditsBalanceSuccessAction
  | FetchShopCreditsBalanceFailureAction

export function shopCreditsReducer(state: ShopCreditsState = INITIAL_STATE, action: ShopCreditsReducerAction): ShopCreditsState {
  switch (action.type) {
    case FETCH_SHOP_CREDITS_BALANCE_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }
    case FETCH_SHOP_CREDITS_BALANCE_SUCCESS: {
      const { address, balance } = action.payload

      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null,
        balances: {
          ...state.balances,
          [address]: balance
        }
      }
    }
    case FETCH_SHOP_CREDITS_BALANCE_FAILURE: {
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
