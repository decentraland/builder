import { connect } from 'react-redux'
import { getLocation, push } from 'connected-react-router'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getData as getWallet } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { getCollectionId } from 'modules/location/selectors'
import { getCollection, isOnSaleLoading, getLoading as getLoadingCollection, getStatusByCollectionId } from 'modules/collection/selectors'
import { DELETE_COLLECTION_REQUEST, SET_COLLECTION_MINTERS_REQUEST } from 'modules/collection/actions'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { getCollectionItems } from 'modules/item/selectors'
import { ItemType } from 'modules/item/types'
import { fetchCollectionForumPostReplyRequest, FETCH_COLLECTION_FORUM_POST_REPLY_REQUEST } from 'modules/forum/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './CollectionDetailPage.types'
import CollectionDetailPage from './CollectionDetailPage'

const mapState = (state: RootState): MapStateProps => {
  const collectionId = getCollectionId(state) || ''
  const collection = getCollection(state, collectionId)
  const statusByCollectionId = getStatusByCollectionId(state)
  const tab = getLocation(state).query.tab

  return {
    tab: tab ? (tab as ItemType) : undefined,
    wallet: getWallet(state)!,
    collection,
    isOnSaleLoading: isOnSaleLoading(state) || isLoadingType(getLoadingCollection(state), SET_COLLECTION_MINTERS_REQUEST),
    items: getCollectionItems(state, collectionId),
    status: statusByCollectionId[collectionId],
    isLoading:
      isLoadingType(getLoadingCollection(state), DELETE_COLLECTION_REQUEST) ||
      isLoadingType(getLoadingCollection(state), FETCH_COLLECTION_FORUM_POST_REPLY_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: (path, locationState) => dispatch(push(path, locationState)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onFetchCollectionForumPostReply: id => dispatch(fetchCollectionForumPostReplyRequest(id))
})

export default connect(mapState, mapDispatch)(CollectionDetailPage)
