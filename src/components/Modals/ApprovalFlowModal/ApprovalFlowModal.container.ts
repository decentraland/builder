import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './ApprovalFlowModal.types'
import { getLoading as getLoadingEntityActions } from 'modules/entity/selectors'
import { getLoading as getLoadingItemActions } from 'modules/item/selectors'
import { getLoading as getLoadingCollectionActions } from 'modules/collection/selectors'
import { getPendingTransactions } from 'modules/transaction/selectors'
import { approveCollectionRequest, APPROVE_COLLECTION_REQUEST, APPROVE_COLLECTION_SUCCESS } from 'modules/collection/actions'
import { rescueItemsRequest, RESCUE_ITEMS_REQUEST } from 'modules/item/actions'
import { getErrors, isDeployingBatchedThirdPartyItems } from 'modules/thirdParty/selectors'
import { deployEntitiesRequest, DEPLOY_ENTITIES_REQUEST } from 'modules/entity/actions'
import { getApprovalFlowUpdateProgress } from 'modules/ui/thirdparty/selectors'
import { deployBatchedThirdPartyItemsRequest, reviewThirdPartyRequest, REVIEW_THIRD_PARTY_REQUEST } from 'modules/thirdParty/actions'
import ApprovalFlowModal from './ApprovalFlowModal'

const mapState = (state: RootState): MapStateProps => {
  const loadingEntityActions = getLoadingEntityActions(state)
  const loadingItemActions = getLoadingItemActions(state)
  const loadingCollectionActions = getLoadingCollectionActions(state)
  const pendingTransactions = getPendingTransactions(state)

  return {
    isConfirmingRescueTx: loadingItemActions.some(action => action.type === RESCUE_ITEMS_REQUEST),
    isConfirmingReviewThirdPartyTx: loadingItemActions.some(action => action.type === REVIEW_THIRD_PARTY_REQUEST),
    isDeployingItems:
      loadingEntityActions.some(action => action.type === DEPLOY_ENTITIES_REQUEST) || isDeployingBatchedThirdPartyItems(state),
    isConfirmingApproveTx: loadingCollectionActions.some(action => action.type === APPROVE_COLLECTION_REQUEST),
    isAwaitingApproveTx: pendingTransactions.some(tx => tx.actionType === APPROVE_COLLECTION_SUCCESS),
    TPDeployItemsProgress: getApprovalFlowUpdateProgress(state),
    errors: getErrors(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onRescueItems: (collection, items, contentHashes) => dispatch(rescueItemsRequest(collection, items, contentHashes)),
  onDeployItems: entities => dispatch(deployEntitiesRequest(entities)),
  onDeployThirdPartyItems: (items, collection, tree, hashes) =>
    dispatch(deployBatchedThirdPartyItemsRequest(items, collection, tree, hashes)),
  onApproveCollection: collection => dispatch(approveCollectionRequest(collection)),
  onReviewThirdParty: (thirdPartyId, slots, merkleTreeRoot) => dispatch(reviewThirdPartyRequest(thirdPartyId, slots, merkleTreeRoot))
})

export default connect(mapState, mapDispatch)(ApprovalFlowModal)
