import { RootState } from 'modules/common/types'
import { buildCancelledItemOrder } from 'specs/cancelledTrades'
import { fetchCancelledItemOrdersRequest } from './actions'
import { INITIAL_STATE } from './reducer'
import {
  getCancelledItemOrdersByContractAddress,
  getCancelledItemOrdersGroups,
  getFetchedFor,
  isCancelledItemOrdersIncomplete,
  isLoadingCancelledItemOrders
} from './selectors'
import { CancelledItemOrder } from './types'

let state: RootState
let firstOrder: CancelledItemOrder
let secondOrder: CancelledItemOrder
let unknownCollectionOrder: CancelledItemOrder

beforeEach(() => {
  firstOrder = buildCancelledItemOrder({ id: 'first' })
  secondOrder = buildCancelledItemOrder({ id: 'second', asset: { ...firstOrder.asset, itemId: '1' } })
  unknownCollectionOrder = buildCancelledItemOrder({ id: 'third', asset: { ...firstOrder.asset, contractAddress: '0xunknown' } })
  state = {
    cancelledTrades: {
      ...INITIAL_STATE,
      data: [unknownCollectionOrder, firstOrder, secondOrder],
      collectionsByContractAddress: { '0xcollection': { id: 'a-collection-id', name: 'A collection' } },
      fetchedFor: '0xaddress',
      loading: [fetchCancelledItemOrdersRequest('0xaddress')]
    }
  } as unknown as RootState
})

describe('when getting the address the cancelled item orders were fetched for', () => {
  it('should return the address', () => {
    expect(getFetchedFor(state)).toBe('0xaddress')
  })
})

describe('when getting if the cancelled item orders are loading', () => {
  it('should return true while the request is pending', () => {
    expect(isLoadingCancelledItemOrders(state)).toBe(true)
  })
})

describe('when getting the cancelled item orders of a contract address', () => {
  let contractAddress: string | undefined

  describe('and the contract address is set', () => {
    beforeEach(() => {
      contractAddress = '0xCOLLECTION'
    })

    it('should return the orders of that contract, ignoring the address casing', () => {
      expect(getCancelledItemOrdersByContractAddress(state, contractAddress)).toEqual([firstOrder, secondOrder])
    })
  })

  describe('and the contract address is not set', () => {
    beforeEach(() => {
      contractAddress = undefined
    })

    it('should return an empty list', () => {
      expect(getCancelledItemOrdersByContractAddress(state, contractAddress)).toEqual([])
    })
  })
})

describe('when getting the cancelled item orders grouped by collection', () => {
  it('should return a group per contract with its collection, when known, and its order count, largest first', () => {
    expect(getCancelledItemOrdersGroups(state)).toEqual([
      { contractAddress: '0xcollection', collection: { id: 'a-collection-id', name: 'A collection' }, count: 2 },
      { contractAddress: '0xunknown', collection: null, count: 1 }
    ])
  })
})

describe('when getting if the cancelled item orders are incomplete', () => {
  describe('and the last fetch failed after loading some orders', () => {
    beforeEach(() => {
      state = { ...state, cancelledTrades: { ...state.cancelledTrades, error: 'a page failed' } } as RootState
    })

    it('should return true', () => {
      expect(isCancelledItemOrdersIncomplete(state)).toBe(true)
    })
  })

  describe('and the last fetch failed without loading any order', () => {
    beforeEach(() => {
      state = { ...state, cancelledTrades: { ...state.cancelledTrades, data: [], error: 'a page failed' } } as RootState
    })

    it('should return false', () => {
      expect(isCancelledItemOrdersIncomplete(state)).toBe(false)
    })
  })

  describe('and the last fetch did not fail', () => {
    it('should return false', () => {
      expect(isCancelledItemOrdersIncomplete(state)).toBe(false)
    })
  })
})
