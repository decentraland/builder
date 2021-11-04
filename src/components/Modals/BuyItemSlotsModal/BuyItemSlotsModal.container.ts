import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getManaBalance } from 'modules/wallet/selectors'
import { MapStateProps, MapDispatchProps } from './BuyItemSlotsModal.types'
// import { getLoading as getLoadingCollectionActions } from 'modules/collection/selectors'
// import { getPendingTransactions } from 'modules/transaction/selectors'
import BuyItemSlotsModal from './BuyItemSlotsModal'
import { getThirdPartyItemTiers, isFetchingTiers } from 'modules/tiers/selectors'
import { buyThirdPartyItemTiersRequest, fetchThirdPartyItemTiersRequest } from 'modules/tiers/action'
import { bindActionCreators } from 'redux'

const mapState = (state: RootState): MapStateProps => {
  // const loadingEntityActions = getLoadingEntityActions(state)
  // const pendingTransactions = getPendingTransactions(state)
  // pendingTransactions.some(tx => tx.actionType === APPROVE_COLLECTION_SUCCESS)
  return {
    tiers: getThirdPartyItemTiers(state),
    isFetchingTiers: isFetchingTiers(state),
    isBuyingItemSlots: false,
    manaBalance: getManaBalance(state)
  }
}

const mapDispatch = (dispatch: any): MapDispatchProps =>
  bindActionCreators(
    {
      onFetchThirdPartyItemSlots: fetchThirdPartyItemTiersRequest,
      onBuyItemSlots: buyThirdPartyItemTiersRequest
    },
    dispatch
  )

export default connect(mapState, mapDispatch)(BuyItemSlotsModal)
