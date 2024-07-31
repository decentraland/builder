import { connect } from 'react-redux'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { RootState } from 'modules/common/types'
import { getIdsOfItemsBeingSaved, getStatusByItemId } from 'modules/item/selectors'
import { deleteItemRequest, saveItemRequest } from 'modules/item/actions'
import { MapStateProps, MapDispatch, MapDispatchProps, OwnProps } from './CollectionItemV2.types'
import CollectionItemV2 from './CollectionItemV2'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const statusByItemId = getStatusByItemId(state)

  return {
    loading: !!getIdsOfItemsBeingSaved(state)[ownProps.item.id],
    status: statusByItemId[ownProps.item.id]
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onDelete: item => dispatch(deleteItemRequest(item)),
  onSaveItem: item => dispatch(saveItemRequest(item, {}, { onlySaveItem: true })),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata))
})

export default connect(mapState, mapDispatch)(CollectionItemV2)
