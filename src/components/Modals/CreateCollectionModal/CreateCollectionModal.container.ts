import { connect } from 'react-redux'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { getLoading, getError } from 'modules/collection/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './CreateCollectionModal.types'
import CreateCollectionModal from './CreateCollectionModal'
import { SAVE_COLLECTION_REQUEST, saveCollectionRequest } from 'modules/collection/actions'

const mapState = (state: RootState): MapStateProps => ({
  address: getAddress(state),
  isLoading: isLoadingType(getLoading(state), SAVE_COLLECTION_REQUEST),
  error: getError(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSubmit: collection => dispatch(saveCollectionRequest(collection))
})

export default connect(mapState, mapDispatch)(CreateCollectionModal)
