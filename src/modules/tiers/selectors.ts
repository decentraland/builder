import { LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { getPendingTransactions } from 'modules/transaction/selectors'
import { FETCH_THIRD_PARTY_ITEM_TIERS_REQUEST, BUY_THIRD_PARTY_ITEM_TIERS_SUCCESS, BUY_THIRD_PARTY_ITEM_TIERS_REQUEST } from './actions'
import { ThirdPartyItemTier, TiersState } from './types'

export const getState = (state: RootState) => state.tiers
export const getData = (state: RootState) => getState(state).data
export const getLoading = (state: RootState) => getState(state).loading
export const getError = (state: RootState) => getState(state).error

export const getThirdPartyItemTiers = (state: RootState): ThirdPartyItemTier[] => getState(state).data.thirdParty
export const isFetchingTiers = (state: RootState): boolean => isLoadingType(getLoading(state), FETCH_THIRD_PARTY_ITEM_TIERS_REQUEST)
export const isBuyingItemSlots = (state: RootState): boolean =>
  isLoadingType(getLoading(state), BUY_THIRD_PARTY_ITEM_TIERS_REQUEST) ||
  getPendingTransactions(state).some(tx => tx.actionType === BUY_THIRD_PARTY_ITEM_TIERS_SUCCESS)
