import { action } from 'typesafe-actions'
import { CancelledItemOrder, CancelledItemOrdersCollection } from './types'

export const FETCH_CANCELLED_ITEM_ORDERS_REQUEST = '[Request] Fetch Cancelled Item Orders'
export const FETCH_CANCELLED_ITEM_ORDERS_SUCCESS = '[Success] Fetch Cancelled Item Orders'
export const FETCH_CANCELLED_ITEM_ORDERS_FAILURE = '[Failure] Fetch Cancelled Item Orders'

export const fetchCancelledItemOrdersRequest = (address: string) => action(FETCH_CANCELLED_ITEM_ORDERS_REQUEST, { address })
// `isIncomplete`: a later page failed, so some orders may be missing
export const fetchCancelledItemOrdersSuccess = (
  orders: CancelledItemOrder[],
  collectionsByContractAddress: Record<string, CancelledItemOrdersCollection>,
  isIncomplete = false
) => action(FETCH_CANCELLED_ITEM_ORDERS_SUCCESS, { orders, collectionsByContractAddress, isIncomplete })
export const fetchCancelledItemOrdersFailure = (error: string) => action(FETCH_CANCELLED_ITEM_ORDERS_FAILURE, { error })

export type FetchCancelledItemOrdersRequestAction = ReturnType<typeof fetchCancelledItemOrdersRequest>
export type FetchCancelledItemOrdersSuccessAction = ReturnType<typeof fetchCancelledItemOrdersSuccess>
export type FetchCancelledItemOrdersFailureAction = ReturnType<typeof fetchCancelledItemOrdersFailure>
