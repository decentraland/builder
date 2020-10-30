import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getLoading } from 'modules/collection/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { saveCollectionRequest, SAVE_COLLECTION_REQUEST } from 'modules/collection/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './EditCollectionNameModal.types'
import EditCollectionNameModal from './EditCollectionNameModal'

const mapState = (state: RootState): MapStateProps => ({
  isLoading: isLoadingType(getLoading(state), SAVE_COLLECTION_REQUEST)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSubmit: collection => dispatch(saveCollectionRequest(collection))
})

export default connect(mapState, mapDispatch)(EditCollectionNameModal)
