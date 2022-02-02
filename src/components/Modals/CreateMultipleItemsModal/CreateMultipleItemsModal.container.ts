import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { cancelSaveMultipleItems, saveMultipleItemsRequest, clearStateSaveMultipleItems } from 'modules/item/actions'
import { getSavedItemsFiles, getMultipleItemsSaveState, getProgress } from 'modules/ui/createMultipleItems/selectors'
import { getError } from 'modules/item/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './CreateMultipleItemsModal.types'
import CreateMultipleItemsModal from './CreateMultipleItemsModal'

const mapState = (state: RootState): MapStateProps => ({
  error: getError(state),
  savedItemsFiles: getSavedItemsFiles(state),
  saveMultipleItemsState: getMultipleItemsSaveState(state),
  saveItemsProgress: getProgress(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSaveMultipleItems: builtItems => dispatch(saveMultipleItemsRequest(builtItems)),
  onCancelSaveMultipleItems: () => dispatch(cancelSaveMultipleItems()),
  onModalUnmount: () => dispatch(clearStateSaveMultipleItems())
})

export default connect(mapState, mapDispatch)(CreateMultipleItemsModal)
