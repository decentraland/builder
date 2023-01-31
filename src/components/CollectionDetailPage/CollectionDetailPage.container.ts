import { connect } from 'react-redux'
import { getLocation, push } from 'connected-react-router'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getData as getWallet } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { getCollectionId } from 'modules/location/selectors'
import { getCollection, isOnSaleLoading, getLoading as getLoadingCollection, getStatusByCollectionId } from 'modules/collection/selectors'
import { DELETE_COLLECTION_REQUEST } from 'modules/collection/actions'
import { openModal } from 'modules/modal/actions'
import { getCollectionItems } from 'modules/item/selectors'
import { ItemType } from 'modules/item/types'
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
    isOnSaleLoading: isOnSaleLoading(state),
    items: getCollectionItems(state, collectionId),
    status: statusByCollectionId[collectionId],
    isLoading: isLoadingType(getLoadingCollection(state), DELETE_COLLECTION_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata))
})

export default connect(mapState, mapDispatch)(CollectionDetailPage)
