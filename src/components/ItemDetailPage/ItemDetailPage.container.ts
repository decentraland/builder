import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { getItemId } from 'modules/location/selectors'
import { getItems, getLoading } from 'modules/item/selectors'
import { openModal } from 'modules/modal/actions'
import { FETCH_ITEMS_REQUEST, DELETE_ITEM_REQUEST, deleteItemRequest } from 'modules/item/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './ItemDetailPage.types'
import ItemDetailPage from './ItemDetailPage'

const mapState = (state: RootState): MapStateProps => {
  const itemId = getItemId(state)
  const items = getItems(state)

  const item = items.find(item => item.id === itemId) || null

  return {
    item,
    isLoading: isLoadingType(getLoading(state), FETCH_ITEMS_REQUEST) || isLoadingType(getLoading(state), DELETE_ITEM_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onDelete: item => dispatch(deleteItemRequest(item)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata))
})

export default connect(mapState, mapDispatch)(ItemDetailPage)
