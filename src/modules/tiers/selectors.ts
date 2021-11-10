import { LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { getPendingTransactions } from 'modules/transaction/selectors'
import { FETCH_THIRD_PARTY_ITEM_TIERS_REQUEST, BUY_THIRD_PARTY_ITEM_TIERS_SUCCESS, BUY_THIRD_PARTY_ITEM_TIERS_REQUEST } from './actions'
import { ThirdPartyItemTier, TiersState } from './types'

function getState(state: RootState): TiersState {
  return state.tiers
}

function getLoading(state: RootState): LoadingState {
  return getState(state).loading
}

export function getThirdPartyItemTiers(state: RootState): ThirdPartyItemTier[] {
  return getState(state).data.thirdParty
}

export function isFetchingTiers(state: RootState): boolean {
  return isLoadingType(getLoading(state), FETCH_THIRD_PARTY_ITEM_TIERS_REQUEST)
}

export function isBuyingItemSlots(state: RootState): boolean {
  return (
    isLoadingType(getLoading(state), BUY_THIRD_PARTY_ITEM_TIERS_REQUEST) ||
    getPendingTransactions(state).some(tx => tx.actionType === BUY_THIRD_PARTY_ITEM_TIERS_SUCCESS)
  )
}

export function getError(state: RootState): string | null {
  return getState(state).error
}
