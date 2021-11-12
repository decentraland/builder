import { TransactionStatus } from 'decentraland-dapps/dist/modules/transaction/types'
import { RootState } from 'modules/common/types'
import { addTransactionToState } from 'specs/transactions'
import { addWalletToState } from 'specs/wallet'
import { BUY_THIRD_PARTY_ITEM_TIERS_REQUEST, BUY_THIRD_PARTY_ITEM_TIERS_SUCCESS, FETCH_THIRD_PARTY_ITEM_TIERS_REQUEST } from './actions'
import { getThirdPartyItemTiers, isFetchingTiers, isBuyingItemSlots, getError } from './selectors'
import { ThirdPartyItemTier } from './types'

let state: RootState
const address = '0x0'

beforeEach(() => {
  state = {
    tiers: {
      data: {
        thirdPartyItems: []
      },
      loading: [],
      error: null
    }
  } as any

  state = addWalletToState(state, address)
})

describe('when getting the third party item tiers from the state', () => {
  let tiers: ThirdPartyItemTier[]

  beforeEach(() => {
    tiers = [
      { id: '1', value: '100', price: '1000' },
      { id: '2', value: '200', price: '2000' }
    ]

    state = {
      ...state,
      tiers: {
        ...state.tiers,
        data: {
          ...state.tiers.data,
          thirdPartyItems: tiers
        }
      }
    }
  })

  it('should return the third party item tiers', () => {
    expect(getThirdPartyItemTiers(state)).toBe(tiers)
  })
})

describe('when getting if the third party tiers are being fetched and the tiers are being fetched', () => {
  beforeEach(() => {
    state = {
      ...state,
      tiers: {
        ...state.tiers,
        loading: [{ type: BUY_THIRD_PARTY_ITEM_TIERS_REQUEST }, { type: FETCH_THIRD_PARTY_ITEM_TIERS_REQUEST }]
      }
    }
  })

  it('should return true', () => {
    expect(isFetchingTiers(state)).toBe(true)
  })
})

describe('when getting the error', () => {
  const error = 'error'

  beforeEach(() => {
    state = {
      ...state,
      tiers: {
        ...state.tiers,
        error
      }
    }
  })

  it('should return the error', () => {
    expect(getError(state)).toBe(error)
  })
})

describe('when getting if the third party tiers are being fetched and the tiers are not being fetched', () => {
  beforeEach(() => {
    state = {
      ...state,
      tiers: {
        ...state.tiers,
        loading: [{ type: BUY_THIRD_PARTY_ITEM_TIERS_REQUEST }]
      }
    }
  })

  it('should return false', () => {
    expect(isFetchingTiers(state)).toBe(false)
  })
})

describe('when getting if an item tier is being bought and the action to buy the tiers has been requested', () => {
  beforeEach(() => {
    state = {
      ...state,
      tiers: {
        ...state.tiers,
        loading: [{ type: BUY_THIRD_PARTY_ITEM_TIERS_REQUEST }]
      }
    }
  })

  describe('and the transaction to buy items is pending', () => {
    beforeEach(() => {
      state = addTransactionToState(state, BUY_THIRD_PARTY_ITEM_TIERS_SUCCESS, TransactionStatus.PENDING, address)
    })

    it('should return true', () => {
      expect(isBuyingItemSlots(state)).toBe(true)
    })
  })

  describe('and the transaction to buy items is not pending', () => {
    beforeEach(() => {
      state = addTransactionToState(state, BUY_THIRD_PARTY_ITEM_TIERS_SUCCESS, TransactionStatus.CONFIRMED, address)
    })

    it('should return true', () => {
      expect(isBuyingItemSlots(state)).toBe(true)
    })
  })
})

describe('when getting if an item tier is being bought and the action to buy the tiers has not been requested', () => {
  beforeEach(() => {
    state = {
      ...state,
      tiers: {
        ...state.tiers,
        loading: []
      }
    }
  })

  describe('and the transaction to buy items is pending', () => {
    beforeEach(() => {
      state = addTransactionToState(state, BUY_THIRD_PARTY_ITEM_TIERS_SUCCESS, TransactionStatus.PENDING, address)
    })

    it('should return true', () => {
      expect(isBuyingItemSlots(state)).toBe(true)
    })
  })

  describe('and the transaction to buy items is not pending', () => {
    beforeEach(() => {
      state = addTransactionToState(state, BUY_THIRD_PARTY_ITEM_TIERS_SUCCESS, TransactionStatus.CONFIRMED, address)
    })

    it('should return false', () => {
      expect(isBuyingItemSlots(state)).toBe(false)
    })
  })
})
