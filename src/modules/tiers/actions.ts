import { ChainId } from '@dcl/schemas'
import { buildTransactionPayload } from 'decentraland-dapps/dist/modules/transaction/utils'
import { ThirdParty } from 'modules/thirdParty/types'
import { action } from 'typesafe-actions'
import { ThirdPartyItemTier } from './types'

// Fetch third party tiers

export const FETCH_THIRD_PARTY_ITEM_TIERS_REQUEST = '[Request] Fetch third party item tiers'
export const FETCH_THIRD_PARTY_ITEM_TIERS_SUCCESS = '[Success] Fetch third party item tiers'
export const FETCH_THIRD_PARTY_ITEM_TIERS_FAILURE = '[Failure] Fetch third party item tiers'

export const fetchThirdPartyItemTiersRequest = () => action(FETCH_THIRD_PARTY_ITEM_TIERS_REQUEST)
export const fetchThirdPartyItemTiersSuccess = (tiers: ThirdPartyItemTier[]) => action(FETCH_THIRD_PARTY_ITEM_TIERS_SUCCESS, { tiers })
export const fetchThirdPartyItemTiersFailure = (error: string) => action(FETCH_THIRD_PARTY_ITEM_TIERS_FAILURE, { error })

export type FetchThirdPartyItemTiersRequestAction = ReturnType<typeof fetchThirdPartyItemTiersRequest>
export type FetchThirdPartyItemTiersSuccessAction = ReturnType<typeof fetchThirdPartyItemTiersSuccess>
export type FetchThirdPartyItemTiersFailureAction = ReturnType<typeof fetchThirdPartyItemTiersFailure>

// Buy a third party tier

export const BUY_THIRD_PARTY_ITEM_TIERS_REQUEST = '[Request] Buy a third party item tier'
export const BUY_THIRD_PARTY_ITEM_TIERS_SUCCESS = '[Success] Buy a third party item tier'
export const BUY_THIRD_PARTY_ITEM_TIERS_FAILURE = '[Failure] Buy a third party item tier'

export const buyThirdPartyItemTiersRequest = (thirdParty: ThirdParty, tier: ThirdPartyItemTier) =>
  action(BUY_THIRD_PARTY_ITEM_TIERS_REQUEST, { thirdParty, tier })
export const buyThirdPartyItemTiersSuccess = (txHash: string, chainId: ChainId, thirdParty: ThirdParty, tier: ThirdPartyItemTier) =>
  action(BUY_THIRD_PARTY_ITEM_TIERS_SUCCESS, { thirdParty, tier, ...buildTransactionPayload(chainId, txHash, { tier, thirdParty }) })
export const buyThirdPartyItemTiersFailure = (thirdPartyId: string, tier: ThirdPartyItemTier, error: string) =>
  action(BUY_THIRD_PARTY_ITEM_TIERS_FAILURE, { thirdPartyId, tier, error })

export type BuyThirdPartyItemTiersRequestAction = ReturnType<typeof buyThirdPartyItemTiersRequest>
export type BuyThirdPartyItemTiersSuccessAction = ReturnType<typeof buyThirdPartyItemTiersSuccess>
export type BuyThirdPartyItemTiersFailureAction = ReturnType<typeof buyThirdPartyItemTiersFailure>

// Clear tiers error

export const CLEAR_TIERS_ERROR = 'Clear tiers error'

export const clearTiersError = () => action(CLEAR_TIERS_ERROR)

export type ClearTiersErrorAction = ReturnType<typeof clearTiersError>
