import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { SET_COLLECTION_MINTERS_REQUEST } from 'modules/collection/actions'
import { getCollectionId } from 'modules/location/selectors'
import { getCollection, getCollectionItems, getLoading as getLoadingCollection } from 'modules/collection/selectors'
import { getLoading as getLoadingItem } from 'modules/item/selectors'
import {
  FETCH_COLLECTIONS_REQUEST,
  DELETE_COLLECTION_REQUEST,
  deleteCollectionRequest,
  setCollectionMintersRequest
} from 'modules/collection/actions'
import { openModal } from 'modules/modal/actions'
import { FETCH_ITEMS_REQUEST } from 'modules/item/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './CollectionDetailPage.types'
import CollectionDetailPage from './CollectionDetailPage'

const mapState = (state: RootState): MapStateProps => {
  const collectionId = getCollectionId(state) || ''
  const collection = getCollection(state, collectionId)

  return {
    collection,
    items: getCollectionItems(state, collectionId),
    isOnSaleLoading: isLoadingType(getLoadingCollection(state), SET_COLLECTION_MINTERS_REQUEST),
    isLoading:
      isLoadingType(getLoadingCollection(state), FETCH_COLLECTIONS_REQUEST) ||
      isLoadingType(getLoadingCollection(state), DELETE_COLLECTION_REQUEST) ||
      isLoadingType(getLoadingItem(state), FETCH_ITEMS_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onSetMinters: (collection, minters) => dispatch(setCollectionMintersRequest(collection, minters)),
  onDelete: collection => dispatch(deleteCollectionRequest(collection))
})

export default connect(mapState, mapDispatch)(CollectionDetailPage)
