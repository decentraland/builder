import { Trade, TradeAssetType } from '@dcl/schemas'
import { createItemOrderTradeSuccess } from 'modules/item/actions'
import { Item } from 'modules/item/types'
import { buildCancelledTrade } from 'specs/cancelledItemOrders'
import { fetchCancelledItemOrdersFailure, fetchCancelledItemOrdersRequest, fetchCancelledItemOrdersSuccess } from './actions'
import { CancelledItemOrdersState, INITIAL_STATE, cancelledItemOrdersReducer } from './reducer'
import { CancelledTrade } from 'lib/api/cancelledTrades'
import { CancelledItemOrdersCollection } from './types'

let state: CancelledItemOrdersState
let order: CancelledTrade

beforeEach(() => {
  order = buildCancelledTrade()
})

describe('when reducing the fetch cancelled item orders request action', () => {
  describe('and the orders were already fetched for the same address', () => {
    beforeEach(() => {
      state = { ...INITIAL_STATE, data: [order], fetchedFor: '0xaddress', isIncomplete: true, error: 'an error' }
    })

    it('should keep the orders and clear the incomplete flag and the error', () => {
      expect(cancelledItemOrdersReducer(state, fetchCancelledItemOrdersRequest('0xaddress'))).toEqual({
        ...state,
        isIncomplete: false,
        error: null
      })
    })
  })

  describe('and the orders were fetched for another address', () => {
    beforeEach(() => {
      state = {
        ...INITIAL_STATE,
        data: [order],
        collectionsByContractAddress: { '0xcollection': { id: 'a-collection-id', name: 'A collection' } },
        fetchedFor: '0xanother'
      }
    })

    it('should drop the previous orders and collections and record the new address', () => {
      expect(cancelledItemOrdersReducer(state, fetchCancelledItemOrdersRequest('0xaddress'))).toEqual({
        ...state,
        data: [],
        collectionsByContractAddress: {},
        fetchedFor: '0xaddress'
      })
    })
  })
})

describe('when reducing the fetch cancelled item orders success action', () => {
  let collectionsByContractAddress: Record<string, CancelledItemOrdersCollection>

  beforeEach(() => {
    collectionsByContractAddress = { '0xcollection': { id: 'a-collection-id', name: 'A collection' } }
    state = { ...INITIAL_STATE, fetchedFor: '0xaddress' }
  })

  describe('and every page loaded', () => {
    it('should store the orders and the collections', () => {
      expect(cancelledItemOrdersReducer(state, fetchCancelledItemOrdersSuccess([order], collectionsByContractAddress))).toEqual({
        ...state,
        data: [order],
        collectionsByContractAddress,
        isIncomplete: false
      })
    })
  })

  describe('and a later page failed', () => {
    it('should store the orders that loaded and flag them as incomplete', () => {
      expect(cancelledItemOrdersReducer(state, fetchCancelledItemOrdersSuccess([order], collectionsByContractAddress, true))).toEqual({
        ...state,
        data: [order],
        collectionsByContractAddress,
        isIncomplete: true
      })
    })
  })
})

describe('when reducing the fetch cancelled item orders failure action', () => {
  beforeEach(() => {
    state = { ...INITIAL_STATE, fetchedFor: '0xaddress' }
  })

  it('should store the error', () => {
    expect(cancelledItemOrdersReducer(state, fetchCancelledItemOrdersFailure('an error'))).toEqual({
      ...state,
      error: 'an error'
    })
  })
})

describe('when reducing the create item order trade success action', () => {
  let otherItemOrder: CancelledTrade
  let otherCollectionOrder: CancelledTrade
  let trade: Trade

  beforeEach(() => {
    otherItemOrder = buildCancelledTrade({ id: 'another-item-trade', asset: { ...order.asset, itemId: '1' } })
    otherCollectionOrder = buildCancelledTrade({
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
