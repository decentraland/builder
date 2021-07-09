import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import {
  approveCollectionRequest,
  rejectCollectionRequest,
  APPROVE_COLLECTION_REQUEST,
  REJECT_COLLECTION_REQUEST
} from 'modules/collection/actions'
import { getLoading as getLoadingCollection, hasPendingCurationTransaction } from 'modules/collection/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './ReviewModal.types'
import ReviewModal from './ReviewModal'

const mapState = (state: RootState): MapStateProps => {
  return {
    isLoading:
      isLoadingType(getLoadingCollection(state), APPROVE_COLLECTION_REQUEST) ||
      isLoadingType(getLoadingCollection(state), REJECT_COLLECTION_REQUEST),
    hasPendingTransaction: hasPendingCurationTransaction(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onApprove: collection => dispatch(approveCollectionRequest(collection)),
  onReject: collection => dispatch(rejectCollectionRequest(collection))
})

export default connect(mapState, mapDispatch)(ReviewModal)
