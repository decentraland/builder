import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { openModal } from 'modules/modal/actions'
import { deleteItemRequest } from 'modules/item/actions'
import { getStatusByItemId } from 'modules/item/selectors'
import { setItems } from 'modules/editor/actions'
import { MapStateProps, MapDispatch, MapDispatchProps, OwnProps } from './CollectionItem.types'
import CollectionItem from './CollectionItem'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const statusByItemId = getStatusByItemId(state)

  return {
    ethAddress: getAddress(state),
    status: statusByItemId[ownProps.item.id]
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: (path, locationState) => dispatch(push(path, locationState)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onDeleteItem: item => dispatch(deleteItemRequest(item)),
  onSetItems: items => dispatch(setItems(items))
})

export default connect(mapState, mapDispatch)(CollectionItem)
