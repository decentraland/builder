import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { rejectCollectionRequest, REJECT_COLLECTION_REQUEST } from 'modules/collection/actions'
import { getLoading as getLoadingCollection, hasPendingCurationTransaction } from 'modules/collection/selectors'
import { getLoading as getLoadingCuration } from 'modules/curation/selectors'
import { rejectCurationRequest, REJECT_CURATION_REQUEST } from 'modules/curation/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './RejectionModal.types'
import RejectionModal from './RejectionModal'

const mapState = (state: RootState): MapStateProps => ({
  isLoading:
    isLoadingType(getLoadingCollection(state), REJECT_COLLECTION_REQUEST) ||
    isLoadingType(getLoadingCuration(state), REJECT_CURATION_REQUEST),
  hasPendingTransaction: hasPendingCurationTransaction(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onReject: collection => dispatch(rejectCollectionRequest(collection)),
  onRejectCuration: collection => dispatch(rejectCurationRequest(collection))
})

export default connect(mapState, mapDispatch)(RejectionModal)
