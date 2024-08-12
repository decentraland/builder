import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { rejectCollectionRequest, REJECT_COLLECTION_REQUEST } from 'modules/collection/actions'
import { getLoading as getLoadingCollection, hasPendingCurationTransaction } from 'modules/collection/selectors'
import { getLoading as getLoadingCuration } from 'modules/curations/collectionCuration/selectors'
import { rejectCollectionCurationRequest, REJECT_COLLECTION_CURATION_REQUEST } from 'modules/curations/collectionCuration/actions'
import { hasPendingDisableThirdPartyTransaction, isDisablingThirdParty } from 'modules/thirdParty/selectors'
import { disableThirdPartyRequest } from 'modules/thirdParty/actions'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './RejectionModal.types'
import RejectionModal from './RejectionModal'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => ({
  isLoading:
    isLoadingType(getLoadingCollection(state), REJECT_COLLECTION_REQUEST) ||
    isLoadingType(getLoadingCuration(state), REJECT_COLLECTION_CURATION_REQUEST) ||
    isDisablingThirdParty(state),
  hasPendingTransaction:
    hasPendingCurationTransaction(state) ||
    Boolean(ownProps.thirdParty && hasPendingDisableThirdPartyTransaction(state, ownProps.thirdParty.id))
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onReject: collection => dispatch(rejectCollectionRequest(collection)),
  onRejectCuration: collection => dispatch(rejectCollectionCurationRequest(collection)),
  onDisableThirdParty: (id: string) => dispatch(disableThirdPartyRequest(id))
})

export default connect(mapState, mapDispatch)(RejectionModal)
