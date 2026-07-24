import { action } from 'typesafe-actions'
import { ShopCreditsBalance } from 'lib/api/credits'

// Fetch Shop Credits Balance
export const FETCH_SHOP_CREDITS_BALANCE_REQUEST = '[Request] Fetch Shop Credits Balance'
export const FETCH_SHOP_CREDITS_BALANCE_SUCCESS = '[Success] Fetch Shop Credits Balance'
export const FETCH_SHOP_CREDITS_BALANCE_FAILURE = '[Failure] Fetch Shop Credits Balance'

export const fetchShopCreditsBalanceRequest = (address: string) => action(FETCH_SHOP_CREDITS_BALANCE_REQUEST, { address })
export const fetchShopCreditsBalanceSuccess = (address: string, balance: ShopCreditsBalance) =>
  action(FETCH_SHOP_CREDITS_BALANCE_SUCCESS, { address, balance })
export const fetchShopCreditsBalanceFailure = (address: string, error: string) =>
  action(FETCH_SHOP_CREDITS_BALANCE_FAILURE, { address, error })

export type FetchShopCreditsBalanceRequestAction = ReturnType<typeof fetchShopCreditsBalanceRequest>
export type FetchShopCreditsBalanceSuccessAction = ReturnType<typeof fetchShopCreditsBalanceSuccess>
export type FetchShopCreditsBalanceFailureAction = ReturnType<typeof fetchShopCreditsBalanceFailure>
