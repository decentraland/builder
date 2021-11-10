import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getManaBalance } from 'modules/wallet/selectors'
import { MapStateProps, MapDispatchProps } from './BuyItemSlotsModal.types'
import BuyItemSlotsModal from './BuyItemSlotsModal'
import { getError, getThirdPartyItemTiers, isBuyingItemSlots, isFetchingTiers } from 'modules/tiers/selectors'
import { buyThirdPartyItemTiersRequest, fetchThirdPartyItemTiersRequest } from 'modules/tiers/actions'
import { bindActionCreators } from 'redux'

const mapState = (state: RootState): MapStateProps => {
  return {
    tiers: getThirdPartyItemTiers(state),
    isFetchingTiers: isFetchingTiers(state),
    isBuyingItemSlots: isBuyingItemSlots(state),
    manaBalance: getManaBalance(state),
    error: getError(state)
  }
}

// TODO: Type the bind action creators function
const mapDispatch = (dispatch: any): MapDispatchProps =>
  bindActionCreators<any, any>(
    {
      onFetchThirdPartyItemSlots: fetchThirdPartyItemTiersRequest,
      onBuyItemSlots: buyThirdPartyItemTiersRequest
    },
    dispatch
  )

export default connect(mapState, mapDispatch)(BuyItemSlotsModal)
