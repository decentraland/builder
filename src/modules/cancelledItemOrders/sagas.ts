import { call, put, takeLatest } from 'redux-saga/effects'
import { isErrorWithMessage } from 'decentraland-dapps/dist/lib/error'
import { BuilderAPI } from 'lib/api/builder'
import {
  CANCELLED_TRADES_PAGE_SIZE,
  CancelledTradeReason,
  CancelledTradesAPI,
  CancelledTradesResponse,
  CancelledTradeType,
  FetchCancelledTradesParams
} from 'lib/api/cancelledTrades'
import { Collection } from 'modules/collection/types'
import {
  FETCH_CANCELLED_ITEM_ORDERS_REQUEST,
  FetchCancelledItemOrdersRequestAction,
  fetchCancelledItemOrdersFailure,
  fetchCancelledItemOrdersSuccess
} from './actions'
import { CancelledItemOrder, CancelledItemOrdersCollection } from './types'

export const getCancelledItemOrdersPageParams = (skip: number): FetchCancelledTradesParams => ({
  reason: CancelledTradeReason.CONTRACT_SIGNATURE_INDEX_BUMP,
  types: [CancelledTradeType.PUBLIC_ITEM_ORDER],
  first: CANCELLED_TRADES_PAGE_SIZE,
  skip
})

export function* cancelledItemOrdersSaga(builderAPI: BuilderAPI, cancelledTradesAPI: CancelledTradesAPI) {
  yield takeLatest(FETCH_CANCELLED_ITEM_ORDERS_REQUEST, handleFetchCancelledItemOrdersRequest)

  function* fetchCollectionsByContractAddress(address: string, orders: CancelledItemOrder[]) {
    const collectionsByContractAddress: Record<string, CancelledItemOrdersCollection> = {}
    if (orders.length === 0) {
      return collectionsByContractAddress
    }
    const affectedContracts = new Set(orders.map(order => order.asset.contractAddress.toLowerCase()))
    try {
      // Unpaginated: the server returns every collection the address owns or manages
      const collections: Collection[] = yield call([builderAPI, 'fetchCollections'], address)
      for (const collection of collections) {
        const contractAddress = collection.contractAddress?.toLowerCase()
        if (contractAddress && affectedContracts.has(contractAddress)) {
          collectionsByContractAddress[contractAddress] = { id: collection.id, name: collection.name }
        }
      }
    } catch {
      // Non-fatal: the orders still show, under an unknown collection
    }
    return collectionsByContractAddress
  }

  function* handleFetchCancelledItemOrdersRequest(action: FetchCancelledItemOrdersRequestAction) {
    const { address } = action.payload
    // Keyed by id: pages can shift between requests
    const ordersById = new Map<string, CancelledItemOrder>()
    let isIncomplete = false
    let total = 0
    let skip = 0

    do {
      try {
        const page: CancelledTradesResponse = yield call(
          [cancelledTradesAPI, 'fetchCancelledTrades'],
          getCancelledItemOrdersPageParams(skip)
        )
        page.data.forEach(order => ordersById.set(order.id, order))
        total = page.total
      } catch (error) {
        if (skip === 0) {
          yield put(fetchCancelledItemOrdersFailure(isErrorWithMessage(error) ? error.message : 'Unknown error'))
          return
        }
        // Keep what loaded
        isIncomplete = true
        break
      }
      skip += CANCELLED_TRADES_PAGE_SIZE
    } while (skip < total)

    const orders = Array.from(ordersById.values())
    const collectionsByContractAddress: Record<string, CancelledItemOrdersCollection> = yield call(
      fetchCollectionsByContractAddress,
      address,
      orders
    )
    yield put(fetchCancelledItemOrdersSuccess(orders, collectionsByContractAddress, isIncomplete))
  }
}
