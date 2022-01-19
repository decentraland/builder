import { connect } from 'react-redux'
import { Network } from '@dcl/schemas'
import { RootState } from 'modules/common/types'
import { getError, getThirdPartyItemTiers, isBuyingItemSlots, isFetchingTiers } from 'modules/tiers/selectors'
import { buyThirdPartyItemTiersRequest, clearTiersError, fetchThirdPartyItemTiersRequest } from 'modules/tiers/actions'
import { getManaBalanceForNetwork } from 'modules/wallet/selectors'
import { ThirdParty } from 'modules/thirdParty/types'
import { ThirdPartyItemTier } from 'modules/tiers/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './BuyItemSlotsModal.types'
import BuyItemSlotsModal from './BuyItemSlotsModal'

const mapState = (state: RootState): MapStateProps => {
  return {
    tiers: getThirdPartyItemTiers(state),
    isFetchingTiers: isFetchingTiers(state),
    isBuyingItemSlots: isBuyingItemSlots(state),
    manaBalance: getManaBalanceForNetwork(state, Network.MATIC),
    error: getError(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onFetchThirdPartyItemSlots: () => dispatch(fetchThirdPartyItemTiersRequest()),
  onTierSelected: () => dispatch(clearTiersError()),
  onBeforeClose: () => dispatch(clearTiersError()),
  onBuyItemSlots: (thirdParty: ThirdParty, tier: ThirdPartyItemTier) => dispatch(buyThirdPartyItemTiersRequest(thirdParty, tier))
})

export default connect(mapState, mapDispatch)(BuyItemSlotsModal)
