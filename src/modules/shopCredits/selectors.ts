import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { FETCH_SHOP_CREDITS_BALANCE_REQUEST } from './actions'

export const getState = (state: RootState) => state.shopCredits
export const getBalances = (state: RootState) => getState(state).balances
export const getLoading = (state: RootState) => getState(state).loading
export const getError = (state: RootState) => getState(state).error

export const getShopCreditsBalance = (state: RootState, address: string) => getBalances(state)[address]

export const isFetchingShopCreditsBalance = (state: RootState) => isLoadingType(getLoading(state), FETCH_SHOP_CREDITS_BALANCE_REQUEST)
