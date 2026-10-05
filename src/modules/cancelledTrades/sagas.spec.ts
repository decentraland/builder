import { expectSaga } from 'redux-saga-test-plan'
import { call } from 'redux-saga/effects'
import { throwError } from 'redux-saga-test-plan/providers'
import { BuilderAPI } from 'lib/api/builder'
import {
  CANCELLED_TRADES_PAGE_SIZE,
  CancelledTradeReason,
  CancelledTradesAPI,
  CancelledTradesResponse,
  CancelledTradeType
} from 'lib/api/cancelledTrades'
import { Collection } from 'modules/collection/types'
import { buildCancelledItemOrder } from 'specs/cancelledTrades'
import { fetchCancelledItemOrdersFailure, fetchCancelledItemOrdersRequest, fetchCancelledItemOrdersSuccess } from './actions'
import { cancelledTradesSaga } from './sagas'
import { CancelledItemOrder } from './types'

let builderAPI: BuilderAPI
let cancelledTradesAPI: CancelledTradesAPI
let address: string

beforeEach(() => {
  address = '0xaddress'
  builderAPI = { fetchCollections: jest.fn() } as unknown as BuilderAPI
  cancelledTradesAPI = { fetchCancelledTrades: jest.fn() } as unknown as CancelledTradesAPI
})

describe('when handling the fetch cancelled item orders request', () => {
  let fetchCancelledTradesCall: ReturnType<typeof call>

  beforeEach(() => {
    fetchCancelledTradesCall = call(
      [cancelledTradesAPI, 'fetchCancelledTrades'],
      CancelledTradeReason.CONTRACT_SIGNATURE_INDEX_BUMP,
      CANCELLED_TRADES_PAGE_SIZE
    )
  })

  describe('and the request fails', () => {
    let error: Error

    beforeEach(() => {
      error = new Error('Request failed')
    })

    it('should put the failure action with the error message', () => {
      return expectSaga(cancelledTradesSaga, builderAPI, cancelledTradesAPI)
        .provide([[fetchCancelledTradesCall, throwError(error)]])
        .put(fetchCancelledItemOrdersFailure('Request failed'))
        .dispatch(fetchCancelledItemOrdersRequest(address))
        .silentRun()
    })
  })

  describe('and there are no cancelled item orders', () => {
    let response: CancelledTradesResponse

    beforeEach(() => {
      response = { data: [buildCancelledItemOrder({ type: CancelledTradeType.BID })], total: 1 }
    })

    it('should put the success action with no orders and without fetching the collections', () => {
      return expectSaga(cancelledTradesSaga, builderAPI, cancelledTradesAPI)
        .provide([[fetchCancelledTradesCall, response]])
        .put(fetchCancelledItemOrdersSuccess([], {}))
        .not.call.fn(builderAPI.fetchCollections)
        .dispatch(fetchCancelledItemOrdersRequest(address))
        .silentRun()
    })
  })

  describe('and there are cancelled item orders', () => {
    let itemOrder: CancelledItemOrder
    let response: CancelledTradesResponse
    let collections: Collection[]

    beforeEach(() => {
      itemOrder = buildCancelledItemOrder()
      response = {
        data: [itemOrder, buildCancelledItemOrder({ id: 'a-bid', type: CancelledTradeType.BID })],
        total: 2
      }
      collections = [
        { id: 'a-collection-id', name: 'A collection', contractAddress: '0xcollection' },
        { id: 'unaffected-id', name: 'Unaffected', contractAddress: '0xunaffected' },
        { id: 'unpublished-id', name: 'Unpublished' }
      ] as Collection[]
    })

    it('should put the success action with the item orders and the collections they belong to', () => {
      return expectSaga(cancelledTradesSaga, builderAPI, cancelledTradesAPI)
        .provide([
          [fetchCancelledTradesCall, response],
          [call([builderAPI, 'fetchCollections'], address), collections]
        ])
        .put(fetchCancelledItemOrdersSuccess([itemOrder], { '0xcollection': { id: 'a-collection-id', name: 'A collection' } }))
        .dispatch(fetchCancelledItemOrdersRequest(address))
        .silentRun()
    })
  })
})
