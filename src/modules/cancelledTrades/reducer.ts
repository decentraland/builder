import { CollectionItemTradeAsset, TradeAssetType } from '@dcl/schemas'
import { LoadingState, loadingReducer } from 'decentraland-dapps/dist/modules/loading/reducer'
import { CREATE_ITEM_ORDER_TRADE_SUCCESS, CreateItemOrderTradeSuccessAction } from 'modules/item/actions'
import {
  FETCH_CANCELLED_ITEM_ORDERS_FAILURE,
  FETCH_CANCELLED_ITEM_ORDERS_REQUEST,
  FETCH_CANCELLED_ITEM_ORDERS_SUCCESS,
  FetchCancelledItemOrdersFailureAction,
  FetchCancelledItemOrdersRequestAction,
  FetchCancelledItemOrdersSuccessAction
} from './actions'
import { CancelledItemOrder, CancelledItemOrdersCollection } from './types'

export type CancelledTradesState = {
  data: CancelledItemOrder[]
  // Keyed by lowercased contract address
  collectionsByContractAddress: Record<string, CancelledItemOrdersCollection>
  // Address the last fetch was attempted for, so a failure isn't retried on every render
  fetchedFor: string | null
  loading: LoadingState
  error: string | null
}

export const INITIAL_STATE: CancelledTradesState = {
  data: [],
  collectionsByContractAddress: {},
  fetchedFor: null,
  loading: [],
  error: null
}

type CancelledTradesReducerAction =
  | FetchCancelledItemOrdersRequestAction
  | FetchCancelledItemOrdersSuccessAction
  | FetchCancelledItemOrdersFailureAction
  | CreateItemOrderTradeSuccessAction

export function cancelledTradesReducer(
  state: CancelledTradesState = INITIAL_STATE,
  action: CancelledTradesReducerAction
): CancelledTradesState {
  switch (action.type) {
    case FETCH_CANCELLED_ITEM_ORDERS_REQUEST: {
      return {
        ...state,
        data: state.fetchedFor === action.payload.address ? state.data : [],
        fetchedFor: action.payload.address,
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }
    case FETCH_CANCELLED_ITEM_ORDERS_SUCCESS: {
      return {
        ...state,
        data: action.payload.orders,
        collectionsByContractAddress: action.payload.collectionsByContractAddress,
        loading: loadingReducer(state.loading, action)
      }
    }
    case FETCH_CANCELLED_ITEM_ORDERS_FAILURE: {
      const { partial } = action.payload
      return {
        ...state,
        ...(partial ? { data: partial.orders, collectionsByContractAddress: partial.collectionsByContractAddress } : {}),
        loading: loadingReducer(state.loading, action),
        error: action.payload.error
      }
    }
    case CREATE_ITEM_ORDER_TRADE_SUCCESS: {
      const listed = action.payload.trade.sent.find(
        (asset): asset is CollectionItemTradeAsset => asset.assetType === TradeAssetType.COLLECTION_ITEM
      )
      if (!listed) {
        return state
      }
      const contractAddress = listed.contractAddress.toLowerCase()
      return {
        ...state,
        data: state.data.filter(
          order => !(order.asset.contractAddress.toLowerCase() === contractAddress && order.asset.itemId === listed.itemId)
        )
      }
    }
    default:
      return state
  }
}
