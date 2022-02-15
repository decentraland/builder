import { ChainId } from '@dcl/schemas'
import { buildTransactionPayload } from 'decentraland-dapps/dist/modules/transaction/utils'
import { action } from 'typesafe-actions'
import { ThirdParty } from './types'

// Fetch Third Party Records

export const FETCH_THIRD_PARTIES_REQUEST = '[Request] Fetch Third Parties'
export const FETCH_THIRD_PARTIES_SUCCESS = '[Success] Fetch Third Parties'
export const FETCH_THIRD_PARTIES_FAILURE = '[Failure] Fetch Third Parties'

export const fetchThirdPartiesRequest = (address?: string) => action(FETCH_THIRD_PARTIES_REQUEST, { address })
export const fetchThirdPartiesSuccess = (thirdParties: ThirdParty[]) => action(FETCH_THIRD_PARTIES_SUCCESS, { thirdParties })
export const fetchThirdPartiesFailure = (error: string) => action(FETCH_THIRD_PARTIES_FAILURE, { error })

export type FetchThirdPartiesRequestAction = ReturnType<typeof fetchThirdPartiesRequest>
export type FetchThirdPartiesSuccessAction = ReturnType<typeof fetchThirdPartiesSuccess>
export type FetchThirdPartiesFailureAction = ReturnType<typeof fetchThirdPartiesFailure>

// Fetch third party slot price

export const FETCH_THIRD_PARTY_ITEM_SLOT_PRICE_REQUEST = '[Request] Fetch third party item slot price'
export const FETCH_THIRD_PARTY_ITEM_SLOT_PRICE_SUCCESS = '[Success] Fetch third party item slot price'
export const FETCH_THIRD_PARTY_ITEM_SLOT_PRICE_FAILURE = '[Failure] Fetch third party item slot price'

export const fetchThirdPartyItemSlotPriceRequest = () => action(FETCH_THIRD_PARTY_ITEM_SLOT_PRICE_REQUEST)
export const fetchThirdPartyItemSlotPriceSuccess = (value: number) => action(FETCH_THIRD_PARTY_ITEM_SLOT_PRICE_SUCCESS, { value })
export const fetchThirdPartyItemSlotPriceFailure = (error: string) => action(FETCH_THIRD_PARTY_ITEM_SLOT_PRICE_FAILURE, { error })

export type FetchThirdPartyItemSlotPriceRequestAction = ReturnType<typeof fetchThirdPartyItemSlotPriceRequest>
export type FetchThirdPartyItemSlotPriceSuccessAction = ReturnType<typeof fetchThirdPartyItemSlotPriceSuccess>
export type FetchThirdPartyItemSlotPriceFailureAction = ReturnType<typeof fetchThirdPartyItemSlotPriceFailure>

// Buy a third party slot

export const BUY_THIRD_PARTY_ITEM_SLOT_REQUEST = '[Request] Buy a third party item slot'
export const BUY_THIRD_PARTY_ITEM_SLOT_SUCCESS = '[Success] Buy a third party item slot'
export const BUY_THIRD_PARTY_ITEM_SLOT_FAILURE = '[Failure] Buy a third party item slot'

export const buyThirdPartyItemSlotRequest = (thirdParty: ThirdParty, slotsToBuy: number, priceToPay: number) =>
  action(BUY_THIRD_PARTY_ITEM_SLOT_REQUEST, { thirdParty, slotsToBuy, priceToPay })
export const buyThirdPartyItemSlotSuccess = (txHash: string, chainId: ChainId, thirdParty: ThirdParty, slotsToBuy: number) =>
  action(BUY_THIRD_PARTY_ITEM_SLOT_SUCCESS, {
    thirdParty,
    slotsToBuy,
    ...buildTransactionPayload(chainId, txHash, { thirdParty, slotsToBuy })
  })
export const buyThirdPartyItemSlotFailure = (thirdPartyId: string, slotsToBuy: number, error: string) =>
  action(BUY_THIRD_PARTY_ITEM_SLOT_FAILURE, { thirdPartyId, slotsToBuy, error })

export type BuyThirdPartyItemSlotRequestAction = ReturnType<typeof buyThirdPartyItemSlotRequest>
export type BuyThirdPartyItemSlotSuccessAction = ReturnType<typeof buyThirdPartyItemSlotSuccess>
export type BuyThirdPartyItemSlotFailureAction = ReturnType<typeof buyThirdPartyItemSlotFailure>
