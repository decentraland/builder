import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { getItemId } from 'modules/location/selectors'
import { getCollection } from 'modules/collection/selectors'
import { getWalletItems, getLoading } from 'modules/item/selectors'
import { openModal } from 'modules/modal/actions'
import { FETCH_ITEMS_REQUEST, DELETE_ITEM_REQUEST, deleteItemRequest } from 'modules/item/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './ItemDetailPage.types'
import ItemDetailPage from './ItemDetailPage'

const mapState = (state: RootState): MapStateProps => {
  const itemId = getItemId(state)
  const items = getWalletItems(state)

  const item = items.find(item => item.id === itemId) || null
  const collection = item && item.collectionId ? getCollection(state, item.collectionId) : null

  return {
    item,
    collection,
    isLoading: isLoadingType(getLoading(state), FETCH_ITEMS_REQUEST) || isLoadingType(getLoading(state), DELETE_ITEM_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onDelete: item => dispatch(deleteItemRequest(item)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata))
})

export default connect(mapState, mapDispatch)(ItemDetailPage)
