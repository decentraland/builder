import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { cancelSaveMultipleItems, saveMultipleItemsRequest, clearSaveMultipleItems } from 'modules/item/actions'
import { getSavedItemsFiles, getMultipleItemsSaveState, getProgress } from 'modules/ui/createMultipleItems/selectors'
import { getError } from 'modules/item/selectors'
import { Collection } from 'modules/collection/types'
import { getCollection } from 'modules/collection/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './CreateMultipleItemsModal.types'
import CreateMultipleItemsModal from './CreateMultipleItemsModal'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const collection: Collection | null = ownProps.metadata.collectionId ? getCollection(state, ownProps.metadata.collectionId) : null

  return {
    collection,
    error: getError(state),
    savedItemsFiles: getSavedItemsFiles(state),
    saveMultipleItemsState: getMultipleItemsSaveState(state),
    saveItemsProgress: getProgress(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSaveMultipleItems: builtItems => dispatch(saveMultipleItemsRequest(builtItems)),
  onCancelSaveMultipleItems: () => dispatch(cancelSaveMultipleItems()),
  onModalUnmount: () => dispatch(clearSaveMultipleItems())
})

export default connect(mapState, mapDispatch)(CreateMultipleItemsModal)
