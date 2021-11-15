import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getCollection, getLoading as getCollectionLoading } from 'modules/collection/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getItem, getLoading as getItemLoading } from 'modules/item/selectors'
import { saveCollectionRequest, SAVE_COLLECTION_REQUEST } from 'modules/collection/actions'
import { saveItemRequest, SAVE_ITEM_REQUEST } from 'modules/item/actions'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './EditURNModal.types'
import EditURNModal from './EditURNModal'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { id } = ownProps.metadata

  return {
    collection: getCollection(state, id),
    item: getItem(state, id),
    isLoading:
      isLoadingType(getCollectionLoading(state), SAVE_COLLECTION_REQUEST) || isLoadingType(getItemLoading(state), SAVE_ITEM_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSaveCollection: collection => dispatch(saveCollectionRequest(collection)),
  onSaveItem: (item, contents) => dispatch(saveItemRequest(item, contents))
})

export default connect(mapState, mapDispatch)(EditURNModal)
