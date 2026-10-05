import { call, put, takeLatest } from 'redux-saga/effects'
import { isErrorWithMessage } from 'decentraland-dapps/dist/lib/error'
import { BuilderAPI } from 'lib/api/builder'
import {
  CANCELLED_TRADES_PAGE_SIZE,
  CancelledTradeReason,
  CancelledTradesAPI,
  CancelledTradesResponse,
  CancelledTradeType
} from 'lib/api/cancelledTrades'
import { Collection } from 'modules/collection/types'
import {
  FETCH_CANCELLED_ITEM_ORDERS_REQUEST,
  FetchCancelledItemOrdersRequestAction,
  fetchCancelledItemOrdersFailure,
  fetchCancelledItemOrdersSuccess
} from './actions'
import { CancelledItemOrdersCollection } from './types'

export function* cancelledTradesSaga(builderAPI: BuilderAPI, cancelledTradesAPI: CancelledTradesAPI) {
  yield takeLatest(FETCH_CANCELLED_ITEM_ORDERS_REQUEST, handleFetchCancelledItemOrdersRequest)

  function* handleFetchCancelledItemOrdersRequest(action: FetchCancelledItemOrdersRequestAction) {
    const { address } = action.payload
    try {
      const response: CancelledTradesResponse = yield call(
        [cancelledTradesAPI, 'fetchCancelledTrades'],
        CancelledTradeReason.CONTRACT_SIGNATURE_INDEX_BUMP,
        CANCELLED_TRADES_PAGE_SIZE
      )
      // The Builder only creates item listings
      const orders = response.data.filter(trade => trade.type === CancelledTradeType.PUBLIC_ITEM_ORDER)
      const collectionsByContractAddress: Record<string, CancelledItemOrdersCollection> = {}

      if (orders.length > 0) {
        const affectedContracts = new Set(orders.map(order => order.asset.contractAddress.toLowerCase()))
        const collections: Collection[] = yield call([builderAPI, 'fetchCollections'], address)
        for (const collection of collections) {
          const contractAddress = collection.contractAddress?.toLowerCase()
          if (contractAddress && affectedContracts.has(contractAddress)) {
            collectionsByContractAddress[contractAddress] = { id: collection.id, name: collection.name }
          }
        }
      }

      yield put(fetchCancelledItemOrdersSuccess(orders, collectionsByContractAddress))
    } catch (error) {
      yield put(fetchCancelledItemOrdersFailure(isErrorWithMessage(error) ? error.message : 'Unknown error'))
    }
  }
}
