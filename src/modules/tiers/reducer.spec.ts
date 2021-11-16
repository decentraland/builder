import { ChainId } from '@dcl/schemas'
import { ThirdParty } from 'modules/thirdParty/types'
import {
  buyThirdPartyItemTiersFailure,
  buyThirdPartyItemTiersRequest,
  buyThirdPartyItemTiersSuccess,
  fetchThirdPartyItemTiersFailure,
  fetchThirdPartyItemTiersRequest,
  fetchThirdPartyItemTiersSuccess
} from './actions'
import { tiersReducer } from './reducer'
import { ThirdPartyItemTier, TiersState } from './types'

let state: TiersState
let thirdParty: ThirdParty
let tier: ThirdPartyItemTier
const defaultError = 'anError'

beforeEach(() => {
  thirdParty = { id: '1', name: 'a third party', description: 'some desc', managers: ['0x1', '0x2'], maxItems: '0', totalItems: '0' }
  tier = { id: '2', value: '100', price: '100' }
  state = {
    data: {
      thirdPartyItems: []
    },
    loading: [],
    error: null
  }
})

describe('when reducing the action to request the buying of tiers', () => {
  it('should return a state with the loading reducer set with the action and the error cleared', () => {
    expect(tiersReducer(state, buyThirdPartyItemTiersRequest(thirdParty, tier))).toEqual({
      ...state,
      error: null,
      loading: [buyThirdPartyItemTiersRequest(thirdParty, tier)]
    })
  })
})

describe('when reducing the action that signals a successful purchase of a tier', () => {
  it('should return a state with the loading reducer set without the action', () => {
    expect(
      tiersReducer(
        { ...state, loading: [buyThirdPartyItemTiersRequest(thirdParty, tier)] },
        buyThirdPartyItemTiersSuccess('aTxHash', ChainId.MATIC_MUMBAI, thirdParty, tier)
      )
    ).toEqual({
      ...state,
      loading: []
    })
  })
})

describe('when reducing the action that signals a failing purchase of tiers', () => {
  it('should return a state with the the error set and the loading reducer set without the action', () => {
    expect(
      tiersReducer(
        { ...state, loading: [buyThirdPartyItemTiersRequest(thirdParty, tier)] },
        buyThirdPartyItemTiersFailure(defaultError, thirdParty.id, tier)
      )
    ).toEqual({
      ...state,
      loading: [],
      error: defaultError
    })
  })
})

describe('when reducing the action to request the fetching of tiers', () => {
  it('should return a state with the the loading reducer set with the action and the error cleared', () => {
    expect(tiersReducer(state, fetchThirdPartyItemTiersRequest())).toEqual({
      ...state,
      error: null,
      loading: [fetchThirdPartyItemTiersRequest()]
    })
  })
})

describe('when reducing the action that signals a successful fetch of tiers', () => {
  it('should return a state with the third party tiers set and the loading reducer set without the action ', () => {
    expect(tiersReducer({ ...state, loading: [fetchThirdPartyItemTiersRequest()] }, fetchThirdPartyItemTiersSuccess([tier]))).toEqual({
      ...state,
      loading: [],
      data: {
        thirdPartyItems: [tier]
      }
    })
  })
})

describe('when reducing the action that signals a failing fetch of tiers', () => {
  it('should return a state with the the error set and the loading reducer set without the action', () => {
    expect(tiersReducer({ ...state, loading: [fetchThirdPartyItemTiersRequest()] }, fetchThirdPartyItemTiersFailure(defaultError))).toEqual(
      {
        ...state,
        loading: [],
        error: defaultError
      }
    )
  })
})
