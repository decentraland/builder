import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { RootState } from 'modules/common/types'
import { getManaBalance } from 'modules/wallet/selectors'
import { getError, getThirdPartyItemTiers, isBuyingItemSlots, isFetchingTiers } from 'modules/tiers/selectors'
import { buyThirdPartyItemTiersRequest, fetchThirdPartyItemTiersRequest } from 'modules/tiers/actions'
import { ThirdParty } from 'modules/thirdParty/types'
import { ThirdPartyItemTier } from 'modules/tiers/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './BuyItemSlotsModal.types'
import BuyItemSlotsModal from './BuyItemSlotsModal'

const mapState = (state: RootState): MapStateProps => {
  return {
    tiers: getThirdPartyItemTiers(state),
    isFetchingTiers: isFetchingTiers(state),
    isBuyingItemSlots: isBuyingItemSlots(state),
    manaBalance: getManaBalance(state),
    error: getError(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onFetchThirdPartyItemSlots: () => dispatch(fetchThirdPartyItemTiersRequest()),
  onBuyItemSlots: (thirdParty: ThirdParty, tier: ThirdPartyItemTier) => dispatch(buyThirdPartyItemTiersRequest(thirdParty, tier))
})

export default connect(mapState, mapDispatch)(BuyItemSlotsModal)
