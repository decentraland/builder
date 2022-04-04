import { connect } from 'react-redux'
import { getLocation, push } from 'connected-react-router'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getData as getWallet } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { getData as getAuthorizations } from 'decentraland-dapps/dist/modules/authorization/selectors'
import { locations } from 'routing/locations'
import { RootState } from 'modules/common/types'
import { getCollectionId } from 'modules/location/selectors'
import { getCollection, getLoading as getLoadingCollection } from 'modules/collection/selectors'
import { getCollectionItems, getLoading as getLoadingItem, getPaginationData } from 'modules/item/selectors'
import { FETCH_COLLECTION_ITEMS_PAGES_REQUEST, FETCH_COLLECTION_ITEMS_REQUEST } from 'modules/item/actions'
import { FETCH_COLLECTIONS_REQUEST, DELETE_COLLECTION_REQUEST } from 'modules/collection/actions'
import { openModal } from 'modules/modal/actions'
import { getCollectionThirdParty, isFetchingAvailableSlots } from 'modules/thirdParty/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './ThirdPartyCollectionDetailPage.types'
import CollectionDetailPage from './ThirdPartyCollectionDetailPage'
import { fetchThirdPartyAvailableSlotsRequest } from 'modules/thirdParty/actions'
import { getCollectionType } from 'modules/collection/utils'
import { CollectionType } from 'modules/collection/types'

const mapState = (state: RootState): MapStateProps => {
  const collectionId = getCollectionId(state) || ''
  const collection = getCollection(state, collectionId)
  const currentPage = Number(getLocation(state).query.page) || 1
  const itemsTotal = getPaginationData(state, collectionId)?.total || null
  const items = collection ? getCollectionItems(state, collection.id) : []
  const paginatedData = (collection && getPaginationData(state, collection.id)) || null
  return {
    items,
    itemsTotal,
    currentPage,
    paginatedData,
    wallet: getWallet(state)!,
    collection,
    thirdParty:
      collection && getCollectionType(collection) === CollectionType.THIRD_PARTY ? getCollectionThirdParty(state, collection) : null,
    authorizations: getAuthorizations(state),
    isLoading:
      isLoadingType(getLoadingCollection(state), FETCH_COLLECTIONS_REQUEST) ||
      isLoadingType(getLoadingCollection(state), DELETE_COLLECTION_REQUEST) ||
      isLoadingType(getLoadingItem(state), FETCH_COLLECTION_ITEMS_REQUEST) ||
      isLoadingType(getLoadingItem(state), FETCH_COLLECTION_ITEMS_PAGES_REQUEST),
    isLoadingAvailableSlots: isFetchingAvailableSlots(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onFetchAvailableSlots: (thirdPartyId: string) => dispatch(fetchThirdPartyAvailableSlotsRequest(thirdPartyId)),
  onPageChange: (collectionId: string, page: number) => dispatch(push(locations.thirdPartyCollectionDetail(collectionId, { page })))
})

export default connect(mapState, mapDispatch)(CollectionDetailPage)
