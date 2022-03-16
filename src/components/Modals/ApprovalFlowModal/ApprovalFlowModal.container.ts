import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './ApprovalFlowModal.types'
import { getLoading as getLoadingEntityActions } from 'modules/entity/selectors'
import { getLoading as getLoadingItemActions } from 'modules/item/selectors'
import { getLoading as getLoadingCollectionActions } from 'modules/collection/selectors'
import { getPendingTransactions } from 'modules/transaction/selectors'
import { approveCollectionRequest, APPROVE_COLLECTION_REQUEST, APPROVE_COLLECTION_SUCCESS } from 'modules/collection/actions'
import { rescueItemsRequest, RESCUE_ITEMS_REQUEST } from 'modules/item/actions'
import { deployEntitiesRequest, DEPLOY_ENTITIES_REQUEST } from 'modules/entity/actions'
import { consumeThirdPartyItemSlotsRequest, CONSUME_THIRD_PARTY_ITEM_SLOTS_REQUEST } from 'modules/thirdParty/actions'
import ApprovalFlowModal from './ApprovalFlowModal'

const mapState = (state: RootState): MapStateProps => {
  const loadingEntityActions = getLoadingEntityActions(state)
  const loadingItemActions = getLoadingItemActions(state)
  const loadingCollectionActions = getLoadingCollectionActions(state)
  const pendingTransactions = getPendingTransactions(state)
  return {
    isConfirmingRescueTx: loadingItemActions.some(action => action.type === RESCUE_ITEMS_REQUEST),
    isConfirmingConsumeSlotsTx: loadingItemActions.some(action => action.type === CONSUME_THIRD_PARTY_ITEM_SLOTS_REQUEST),
    isDeployingItems: loadingEntityActions.some(action => action.type === DEPLOY_ENTITIES_REQUEST),
    isConfirmingApproveTx: loadingCollectionActions.some(action => action.type === APPROVE_COLLECTION_REQUEST),
    isAwaitingApproveTx: pendingTransactions.some(tx => tx.actionType === APPROVE_COLLECTION_SUCCESS)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onRescueItems: (collection, items, contentHashes) => dispatch(rescueItemsRequest(collection, items, contentHashes)),
  onDeployItems: entities => dispatch(deployEntitiesRequest(entities)),
  onApproveCollection: collection => dispatch(approveCollectionRequest(collection)),
  onConsumeTPSlots: (thirdPartyId, slots, merkleTreeRoot) =>
    dispatch(consumeThirdPartyItemSlotsRequest(thirdPartyId, slots, merkleTreeRoot))
})

export default connect(mapState, mapDispatch)(ApprovalFlowModal)
