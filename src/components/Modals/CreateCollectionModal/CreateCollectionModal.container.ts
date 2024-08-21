import { connect } from 'react-redux'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { openModal } from 'decentraland-dapps/dist/modules/modal'
import { RootState } from 'modules/common/types'
import { getLoading, getError } from 'modules/collection/selectors'
import { SAVE_COLLECTION_REQUEST, saveCollectionRequest } from 'modules/collection/actions'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './CreateCollectionModal.types'
import CreateCollectionModal from './CreateCollectionModal'
import { getIsLinkedWearablesPaymentsEnabled } from 'modules/features/selectors'

const mapState = (state: RootState): MapStateProps => ({
  address: getAddress(state),
  isLoading: isLoadingType(getLoading(state), SAVE_COLLECTION_REQUEST),
  isLinkedWearablesPaymentsEnabled: getIsLinkedWearablesPaymentsEnabled(state),
  error: getError(state)
})

const mapDispatch = (dispatch: MapDispatch, ownProps: OwnProps): MapDispatchProps => ({
  onBack: () => {
    ownProps.onClose()
    dispatch(openModal('CreateCollectionSelectorModal'))
  },
  onSubmit: collection => dispatch(saveCollectionRequest(collection))
})

export default connect(mapState, mapDispatch)(CreateCollectionModal)
