import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { RootState } from 'modules/common/types'
import { getStatusByItemId } from 'modules/item/selectors'
import { deleteItemRequest } from 'modules/item/actions'
import { MapStateProps, MapDispatch, MapDispatchProps, OwnProps } from './CollectionItem.types'
import CollectionItem from './CollectionItem'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const statusByItemId = getStatusByItemId(state)
  return {
    status: statusByItemId[ownProps.item.id]
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onDelete: item => dispatch(deleteItemRequest(item)),
  onNavigate: (path, locationState) => dispatch(push(path, locationState)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata))
})

export default connect(mapState, mapDispatch)(CollectionItem)
