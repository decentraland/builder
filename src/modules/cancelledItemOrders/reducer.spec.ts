import { Trade, TradeAssetType } from '@dcl/schemas'
import { createItemOrderTradeSuccess } from 'modules/item/actions'
import { Item } from 'modules/item/types'
import { buildCancelledItemOrder } from 'specs/cancelledItemOrders'
import { fetchCancelledItemOrdersFailure, fetchCancelledItemOrdersRequest, fetchCancelledItemOrdersSuccess } from './actions'
import { CancelledItemOrdersState, INITIAL_STATE, cancelledItemOrdersReducer } from './reducer'
import { CancelledItemOrder, CancelledItemOrdersCollection } from './types'

let state: CancelledItemOrdersState
let order: CancelledItemOrder

beforeEach(() => {
  order = buildCancelledItemOrder()
})

describe('when reducing the fetch cancelled item orders request action', () => {
  describe('and the orders were already fetched for the same address', () => {
    beforeEach(() => {
      state = { ...INITIAL_STATE, data: [order], fetchedFor: '0xaddress' }
    })

    it('should keep the orders and add the loading state', () => {
      expect(cancelledItemOrdersReducer(state, fetchCancelledItemOrdersRequest('0xaddress'))).toEqual({
        ...state,
        loading: [fetchCancelledItemOrdersRequest('0xaddress')]
      })
    })
  })

  describe('and the orders were fetched for another address', () => {
    beforeEach(() => {
      state = { ...INITIAL_STATE, data: [order], fetchedFor: '0xanother' }
    })

    it('should drop the previous orders and record the new address', () => {
      expect(cancelledItemOrdersReducer(state, fetchCancelledItemOrdersRequest('0xaddress'))).toEqual({
        ...state,
        data: [],
        fetchedFor: '0xaddress',
        loading: [fetchCancelledItemOrdersRequest('0xaddress')]
      })
    })
  })
})

describe('when reducing the fetch cancelled item orders success action', () => {
  let collectionsByContractAddress: Record<string, CancelledItemOrdersCollection>

  beforeEach(() => {
    collectionsByContractAddress = { '0xcollection': { id: 'a-collection-id', name: 'A collection' } }
    state = { ...INITIAL_STATE, fetchedFor: '0xaddress', loading: [fetchCancelledItemOrdersRequest('0xaddress')] }
  })

  it('should store the orders and the collections and clear the loading state', () => {
    expect(cancelledItemOrdersReducer(state, fetchCancelledItemOrdersSuccess([order], collectionsByContractAddress))).toEqual({
      ...state,
      data: [order],
      collectionsByContractAddress,
      loading: []
    })
  })
})

describe('when reducing the fetch cancelled item orders failure action', () => {
  beforeEach(() => {
    state = { ...INITIAL_STATE, fetchedFor: '0xaddress', loading: [fetchCancelledItemOrdersRequest('0xaddress')] }
  })

  describe('and nothing loaded before the failure', () => {
    it('should store the error and clear the loading state', () => {
      expect(cancelledItemOrdersReducer(state, fetchCancelledItemOrdersFailure('an error'))).toEqual({
        ...state,
        error: 'an error',
        loading: []
      })
    })
  })

  describe('and some orders loaded before the failure', () => {
    let collectionsByContractAddress: Record<string, CancelledItemOrdersCollection>

    beforeEach(() => {
      collectionsByContractAddress = { '0xcollection': { id: 'a-collection-id', name: 'A collection' } }
    })

    it('should store the loaded orders and collections along with the error', () => {
      expect(
        cancelledItemOrdersReducer(state, fetchCancelledItemOrdersFailure('an error', { orders: [order], collectionsByContractAddress }))
      ).toEqual({
        ...state,
        data: [order],
        collectionsByContractAddress,
        error: 'an error',
        loading: []
      })
    })
  })
})

describe('when reducing the create item order trade success action', () => {
  let otherItemOrder: CancelledItemOrder
  let otherCollectionOrder: CancelledItemOrder
  let trade: Trade

  beforeEach(() => {
    otherItemOrder = buildCancelledItemOrder({ id: 'another-item-trade', asset: { ...order.asset, itemId: '1' } })
    otherCollectionOrder = buildCancelledItemOrder({
      id: 'another-collection-trade',
      asset: { ...order.asset, contractAddress: '0xother' }
    })
    state = { ...INITIAL_STATE, data: [order, otherItemOrder, otherCollectionOrder] }
    trade = {
      id: 'a-new-trade-id',
      sent: [{ assetType: TradeAssetType.COLLECTION_ITEM, contractAddress: '0xcollection', itemId: '0', extra: '' }],
      received: []
    } as unknown as Trade
  })

  it('should drop only the cancelled order of the re-listed item', () => {
    expect(
      cancelledItemOrdersReducer(state, createItemOrderTradeSuccess(trade, { id: 'an-item-id' } as Item, '1', '0xbeneficiary', 0)).data
    ).toEqual([otherItemOrder, otherCollectionOrder])
  })
})
