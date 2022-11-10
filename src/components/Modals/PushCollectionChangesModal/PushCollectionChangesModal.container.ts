import { connect } from 'react-redux'
import { pushCollectionCurationRequest, PUSH_COLLECTION_CURATION_REQUEST } from 'modules/curations/collectionCuration/actions'
import { MapDispatchProps, MapDispatch, MapStateProps, OwnProps } from './PushCollectionChangesModal.types'
import PushCollectionChangesModal from './PushCollectionChangesModal'
import { RootState } from 'modules/common/types'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getLoading } from 'modules/curations/collectionCuration/selectors'

const mapState = (store: RootState): MapStateProps => ({
  isLoading: isLoadingType(getLoading(store), PUSH_COLLECTION_CURATION_REQUEST)
})

const mapDispatch = (dispatch: MapDispatch, ownProps: OwnProps): MapDispatchProps => ({
  onProceed: () => dispatch(pushCollectionCurationRequest(ownProps.metadata.collectionId))
})

export default connect(mapState, mapDispatch)(PushCollectionChangesModal)
