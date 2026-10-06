import { expectSaga } from 'redux-saga-test-plan'
import { call } from 'redux-saga/effects'
import { throwError } from 'redux-saga-test-plan/providers'
import { BuilderAPI } from 'lib/api/builder'
import { CancelledTradeReason, CancelledTradesAPI, CancelledTradesResponse, CancelledTradeType } from 'lib/api/cancelledTrades'
import { Collection } from 'modules/collection/types'
import { buildCancelledItemOrder } from 'specs/cancelledItemOrders'
import { fetchCancelledItemOrdersFailure, fetchCancelledItemOrdersRequest, fetchCancelledItemOrdersSuccess } from './actions'
import { cancelledItemOrdersSaga, getCancelledItemOrdersPageParams } from './sagas'
import { CancelledItemOrder } from './types'

let builderAPI: BuilderAPI
let cancelledTradesAPI: CancelledTradesAPI
let address: string
let collections: Collection[]

const pageCall = (skip: number) => call([cancelledTradesAPI, 'fetchCancelledTrades'], getCancelledItemOrdersPageParams(skip))
const buildOrders = (from: number, to: number): CancelledItemOrder[] =>
  Array.from({ length: to - from }, (_, index) =>
    buildCancelledItemOrder({ id: `trade-${from + index}`, asset: { ...buildCancelledItemOrder().asset, itemId: `${from + index}` } })
  )

beforeEach(() => {
  address = '0xaddress'
  builderAPI = { fetchCollections: jest.fn() } as unknown as BuilderAPI
  cancelledTradesAPI = { fetchCancelledTrades: jest.fn() } as unknown as CancelledTradesAPI
  collections = [
    { id: 'a-collection-id', name: 'A collection', contractAddress: '0xcollection' },
    { id: 'unaffected-id', name: 'Unaffected', contractAddress: '0xunaffected' },
    { id: 'unpublished-id', name: 'Unpublished' }
  ] as Collection[]
})

describe('when getting the params of a cancelled item orders page', () => {
  it('should request a full page of public item orders cancelled by the signature index bump, from the given offset', () => {
    expect(getCancelledItemOrdersPageParams(200)).toEqual({
      reason: CancelledTradeReason.CONTRACT_SIGNATURE_INDEX_BUMP,
      types: [CancelledTradeType.PUBLIC_ITEM_ORDER],
      first: 100,
      skip: 200
    })
  })
})

describe('when handling the fetch cancelled item orders request', () => {
  describe('and the first page fails', () => {
    it('should put the failure action with the error message and without fetching the collections', () => {
      return expectSaga(cancelledItemOrdersSaga, builderAPI, cancelledTradesAPI)
        .provide([[pageCall(0), throwError(new Error('Request failed'))]])
        .put(fetchCancelledItemOrdersFailure('Request failed'))
        .not.call.fn(builderAPI.fetchCollections)
        .dispatch(fetchCancelledItemOrdersRequest(address))
        .silentRun()
    })
  })

  describe('and there are no cancelled item orders', () => {
    let response: CancelledTradesResponse

    beforeEach(() => {
      response = { data: [], total: 0 }
    })

    it('should put the success action with no orders and without fetching the collections', () => {
      return expectSaga(cancelledItemOrdersSaga, builderAPI, cancelledTradesAPI)
        .provide([[pageCall(0), response]])
        .put(fetchCancelledItemOrdersSuccess([], {}))
        .not.call.fn(builderAPI.fetchCollections)
        .dispatch(fetchCancelledItemOrdersRequest(address))
        .silentRun()
    })
  })

  describe('and every cancelled item order fits in one page', () => {
    let itemOrder: CancelledItemOrder
    let response: CancelledTradesResponse

    beforeEach(() => {
      itemOrder = buildCancelledItemOrder()
      // The bid covers a server that ignores the type filter
      response = { data: [itemOrder, buildCancelledItemOrder({ id: 'a-bid', type: CancelledTradeType.BID })], total: 1 }
    })

    it('should put the success action with only the item orders and the collections they belong to', () => {
      return expectSaga(cancelledItemOrdersSaga, builderAPI, cancelledTradesAPI)
        .provide([
          [pageCall(0), response],
          [call([builderAPI, 'fetchCollections'], address), collections]
        ])
        .put(fetchCancelledItemOrdersSuccess([itemOrder], { '0xcollection': { id: 'a-collection-id', name: 'A collection' } }))
        .dispatch(fetchCancelledItemOrdersRequest(address))
        .silentRun()
    })
  })

  describe('and the cancelled item orders span several pages', () => {
    let orders: CancelledItemOrder[]
    let pages: CancelledTradesResponse[]

    beforeEach(() => {
      orders = buildOrders(0, 450)
      pages = [0, 100, 200, 300, 400].map(skip => ({ data: orders.slice(skip, skip + 100), total: 450 }))
      // A shifted page repeats an order of the previous one
      pages[2] = { ...pages[2], data: [orders[199], ...pages[2].data] }
    })

    it('should fetch every page and put the success action with the orders without duplicates', () => {
      return expectSaga(cancelledItemOrdersSaga, builderAPI, cancelledTradesAPI)
        .provide([
          [pageCall(0), pages[0]],
          [pageCall(100), pages[1]],
          [pageCall(200), pages[2]],
          [pageCall(300), pages[3]],
          [pageCall(400), pages[4]],
          [call([builderAPI, 'fetchCollections'], address), collections]
        ])
        .put(fetchCancelledItemOrdersSuccess(orders, { '0xcollection': { id: 'a-collection-id', name: 'A collection' } }))
        .dispatch(fetchCancelledItemOrdersRequest(address))
        .silentRun()
    })
  })

  describe('and a page fails after others loaded', () => {
    let orders: CancelledItemOrder[]

    beforeEach(() => {
      orders = buildOrders(0, 450)
    })

    it('should stop fetching and put the failure action with the orders that loaded and their collections', () => {
      return expectSaga(cancelledItemOrdersSaga, builderAPI, cancelledTradesAPI)
        .provide([
          [pageCall(0), { data: orders.slice(0, 100), total: 450 }],
          [pageCall(100), { data: orders.slice(100, 200), total: 450 }],
          [pageCall(200), throwError(new Error('Page failed'))],
          [pageCall(300), { data: orders.slice(300, 400), total: 450 }],
          [call([builderAPI, 'fetchCollections'], address), collections]
        ])
        .put(
          fetchCancelledItemOrdersFailure('Page failed', {
            orders: [...orders.slice(0, 200), ...orders.slice(300, 400)],
            collectionsByContractAddress: { '0xcollection': { id: 'a-collection-id', name: 'A collection' } }
          })
        )
        .not.call([cancelledTradesAPI, 'fetchCancelledTrades'], getCancelledItemOrdersPageParams(400))
        .dispatch(fetchCancelledItemOrdersRequest(address))
        .silentRun()
    })
  })

  describe('and the collections fail to load', () => {
    it('should put the failure action with the error message', () => {
      return expectSaga(cancelledItemOrdersSaga, builderAPI, cancelledTradesAPI)
        .provide([
          [pageCall(0), { data: [buildCancelledItemOrder()], total: 1 }],
          [call([builderAPI, 'fetchCollections'], address), throwError(new Error('Collections failed'))]
        ])
        .put(fetchCancelledItemOrdersFailure('Collections failed'))
        .dispatch(fetchCancelledItemOrdersRequest(address))
        .silentRun()
    })
  })
})
