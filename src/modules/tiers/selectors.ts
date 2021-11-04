import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getLoading } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { FETCH_THIRD_PARTY_ITEM_TIERS_REQUEST } from './action'

export function getThirdPartyItemTiers(state: RootState) {
  return state.tiers.data.thirdParty
}

export function isFetchingTiers(state: RootState) {
  return isLoadingType(getLoading(state), FETCH_THIRD_PARTY_ITEM_TIERS_REQUEST)
}
