import { action } from 'typesafe-actions'
import { CancelledItemOrder, CancelledItemOrdersCollection, CancelledItemOrdersResult } from './types'

export const FETCH_CANCELLED_ITEM_ORDERS_REQUEST = '[Request] Fetch Cancelled Item Orders'
export const FETCH_CANCELLED_ITEM_ORDERS_SUCCESS = '[Success] Fetch Cancelled Item Orders'
export const FETCH_CANCELLED_ITEM_ORDERS_FAILURE = '[Failure] Fetch Cancelled Item Orders'

export const fetchCancelledItemOrdersRequest = (address: string) => action(FETCH_CANCELLED_ITEM_ORDERS_REQUEST, { address })
export const fetchCancelledItemOrdersSuccess = (
  orders: CancelledItemOrder[],
  collectionsByContractAddress: Record<string, CancelledItemOrdersCollection>
) => action(FETCH_CANCELLED_ITEM_ORDERS_SUCCESS, { orders, collectionsByContractAddress })
// `partial` carries what loaded before a page failed
export const fetchCancelledItemOrdersFailure = (error: string, partial?: CancelledItemOrdersResult) =>
  action(FETCH_CANCELLED_ITEM_ORDERS_FAILURE, { error, partial })

export type FetchCancelledItemOrdersRequestAction = ReturnType<typeof fetchCancelledItemOrdersRequest>
export type FetchCancelledItemOrdersSuccessAction = ReturnType<typeof fetchCancelledItemOrdersSuccess>
export type FetchCancelledItemOrdersFailureAction = ReturnType<typeof fetchCancelledItemOrdersFailure>
