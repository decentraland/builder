import { all, call, put, takeLatest } from 'redux-saga/effects'
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

export const MAX_CONCURRENT_PAGES = 3

export const getCancelledItemOrdersPageParams = (skip: number): FetchCancelledTradesParams => ({
  reason: CancelledTradeReason.CONTRACT_SIGNATURE_INDEX_BUMP,
  types: [CancelledTradeType.PUBLIC_ITEM_ORDER],
  first: CANCELLED_TRADES_PAGE_SIZE,
  skip
})

type PageResult = { page: CancelledTradesResponse } | { error: string }

const getErrorMessage = (error: unknown) => (isErrorWithMessage(error) ? error.message : 'Unknown error')

export function* cancelledItemOrdersSaga(builderAPI: BuilderAPI, cancelledTradesAPI: CancelledTradesAPI) {
  yield takeLatest(FETCH_CANCELLED_ITEM_ORDERS_REQUEST, handleFetchCancelledItemOrdersRequest)

  // Settles instead of throwing so a failed page keeps the pages fetched alongside it
  function* fetchPage(skip: number): Generator<unknown, PageResult, CancelledTradesResponse> {
    try {
      const page: CancelledTradesResponse = yield call([cancelledTradesAPI, 'fetchCancelledTrades'], getCancelledItemOrdersPageParams(skip))
      return { page }
    } catch (error) {
      return { error: getErrorMessage(error) }
    }
  }

  function* handleFetchCancelledItemOrdersRequest(action: FetchCancelledItemOrdersRequestAction) {
    const { address } = action.payload
    // Keyed by id: pages can shift between requests
    const ordersById = new Map<string, CancelledItemOrder>()
    const addPage = (page: CancelledTradesResponse) => {
      for (const trade of page.data) {
        // The server filters by type already; this guards against older deployments
        if (trade.type === CancelledTradeType.PUBLIC_ITEM_ORDER) {
          ordersById.set(trade.id, trade)
        }
      }
    }

    // Every page is needed to group the orders by collection
    let pageError: string | null = null
    try {
      const firstPage: CancelledTradesResponse = yield call(
        [cancelledTradesAPI, 'fetchCancelledTrades'],
        getCancelledItemOrdersPageParams(0)
      )
      addPage(firstPage)

      const skips: number[] = []
      for (let skip = CANCELLED_TRADES_PAGE_SIZE; skip < firstPage.total; skip += CANCELLED_TRADES_PAGE_SIZE) {
        skips.push(skip)
      }
      for (let i = 0; i < skips.length && !pageError; i += MAX_CONCURRENT_PAGES) {
        const results: PageResult[] = yield all(skips.slice(i, i + MAX_CONCURRENT_PAGES).map(skip => call(fetchPage, skip)))
        for (const result of results) {
          if ('page' in result) {
            addPage(result.page)
          } else {
            pageError = pageError ?? result.error
          }
        }
      }
    } catch (error) {
      pageError = getErrorMessage(error)
    }

    const orders = Array.from(ordersById.values())
    try {
      const collectionsByContractAddress: Record<string, CancelledItemOrdersCollection> = {}
      if (orders.length > 0) {
        const affectedContracts = new Set(orders.map(order => order.asset.contractAddress.toLowerCase()))
        // Unpaginated: the server returns every collection the address owns or manages
        const collections: Collection[] = yield call([builderAPI, 'fetchCollections'], address)
        for (const collection of collections) {
          const contractAddress = collection.contractAddress?.toLowerCase()
          if (contractAddress && affectedContracts.has(contractAddress)) {
            collectionsByContractAddress[contractAddress] = { id: collection.id, name: collection.name }
          }
        }
      }

      if (pageError) {
        yield put(fetchCancelledItemOrdersFailure(pageError, orders.length > 0 ? { orders, collectionsByContractAddress } : undefined))
      } else {
        yield put(fetchCancelledItemOrdersSuccess(orders, collectionsByContractAddress))
      }
    } catch (error) {
      yield put(fetchCancelledItemOrdersFailure(pageError ?? getErrorMessage(error)))
    }
  }
}
