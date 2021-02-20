import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { getCollectionId } from 'modules/location/selectors'
import { getCollection, getCollectionItems, isOnSaleLoading, getLoading as getLoadingCollection } from 'modules/collection/selectors'
import { getLoading as getLoadingItem } from 'modules/item/selectors'
import { FETCH_COLLECTIONS_REQUEST, DELETE_COLLECTION_REQUEST, deleteCollectionRequest } from 'modules/collection/actions'
import { openModal } from 'modules/modal/actions'
import { FETCH_ITEMS_REQUEST } from 'modules/item/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './CollectionDetailPage.types'
import CollectionDetailPage from './CollectionDetailPage'

const mapState = (state: RootState): MapStateProps => {
  const collectionId = getCollectionId(state) || ''
  const collection = getCollection(state, collectionId)

  return {
    ethAddress: getAddress(state),
    items: getCollectionItems(state, collectionId),
    isOnSaleLoading: isOnSaleLoading(state),
    isLoading:
      isLoadingType(getLoadingCollection(state), FETCH_COLLECTIONS_REQUEST) ||
      isLoadingType(getLoadingCollection(state), DELETE_COLLECTION_REQUEST) ||
      isLoadingType(getLoadingItem(state), FETCH_ITEMS_REQUEST),
    collection
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onDelete: collection => dispatch(deleteCollectionRequest(collection))
})

export default connect(mapState, mapDispatch)(CollectionDetailPage)
