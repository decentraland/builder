import { ChainId } from '@dcl/schemas'
import { buildTransactionPayload } from 'decentraland-dapps/dist/modules/transaction/utils'
import { ThirdParty } from 'modules/thirdParty/types'
import {
  fetchThirdPartyItemTiersRequest,
  fetchThirdPartyItemTiersSuccess,
  fetchThirdPartyItemTiersFailure,
  FETCH_THIRD_PARTY_ITEM_TIERS_REQUEST,
  FETCH_THIRD_PARTY_ITEM_TIERS_SUCCESS,
  FETCH_THIRD_PARTY_ITEM_TIERS_FAILURE,
  buyThirdPartyItemTiersRequest,
  BUY_THIRD_PARTY_ITEM_TIERS_SUCCESS,
  BUY_THIRD_PARTY_ITEM_TIERS_REQUEST,
  buyThirdPartyItemTiersSuccess,
  BUY_THIRD_PARTY_ITEM_TIERS_FAILURE,
  buyThirdPartyItemTiersFailure
} from './actions'
import { ThirdPartyItemTier } from './types'

let thirdParty: ThirdParty
let thirdPartyItemTier: ThirdPartyItemTier
const defaultError = 'anError'

beforeEach(() => {
  thirdParty = {
    id: '1',
    name: 'test',
    description: 'aDescription',
    managers: [],
    maxItems: '1',
    totalItems: '1'
  }
  thirdPartyItemTier = { id: '1', value: '1000', price: '1000' }
})

describe('when creating the action that signals the start of a tiers fetch request', () => {
  it('should return an action signaling the start of the tiers fetch', () => {
    expect(fetchThirdPartyItemTiersRequest()).toEqual({ type: FETCH_THIRD_PARTY_ITEM_TIERS_REQUEST })
  })
})

describe('when creating the action that signals the successful fetch of tiers', () => {
  it('should return an action signaling the success of the tiers fetch', () => {
    expect(fetchThirdPartyItemTiersSuccess([thirdPartyItemTier])).toEqual({
      type: FETCH_THIRD_PARTY_ITEM_TIERS_SUCCESS,
      payload: { tiers: [thirdPartyItemTier], error: undefined, meta: undefined }
    })
  })
})

describe('when creating the action that signals the unsuccessful fetch of tiers', () => {
  it('should return an action signaling the failure of the tiers fetch', () => {
    expect(fetchThirdPartyItemTiersFailure(defaultError)).toEqual({
      type: FETCH_THIRD_PARTY_ITEM_TIERS_FAILURE,
      payload: { error: defaultError }
    })
  })
})

describe('when creating the action that signals the start of an item slots tier purchase', () => {
  it('should return an action signaling the start of the item tier slots purchase', () => {
    expect(buyThirdPartyItemTiersRequest(thirdParty, thirdPartyItemTier)).toEqual({
      type: BUY_THIRD_PARTY_ITEM_TIERS_REQUEST,
      payload: {
        error: undefined,
        meta: undefined,
        thirdParty,
        tier: thirdPartyItemTier
      }
    })
  })
})

describe('when creating the action that signals the successful purchase of an item slots tier', () => {
  const txHash = '0x123'
  const chainId = ChainId.MATIC_MUMBAI

  it('should return an action signaling the success of an item tier slots purchase', () => {
    expect(buyThirdPartyItemTiersSuccess(txHash, chainId, thirdParty, thirdPartyItemTier)).toEqual({
      type: BUY_THIRD_PARTY_ITEM_TIERS_SUCCESS,
      error: undefined,
      meta: undefined,
      payload: {
        tier: thirdPartyItemTier,
        thirdParty,
        ...buildTransactionPayload(chainId, txHash, { tier: thirdPartyItemTier, thirdParty })
      }
    })
  })
})

describe('when creating the action that signals the unsuccessful purchase of an item slots tier', () => {
  it('should return an action signaling the unsuccessful purchase of an item slots tier', () => {
    expect(buyThirdPartyItemTiersFailure(thirdParty.id, thirdPartyItemTier, defaultError)).toEqual({
      type: BUY_THIRD_PARTY_ITEM_TIERS_FAILURE,
      payload: { error: defaultError, thirdPartyId: thirdParty.id, tier: thirdPartyItemTier }
    })
  })
})
