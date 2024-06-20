import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getData as getWallet } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { getData as getAuthorizations } from 'decentraland-dapps/dist/modules/authorization/selectors'
import { RootState } from 'modules/common/types'
import { getCollectionId } from 'modules/location/selectors'
import { getCollection, getLoading as getLoadingCollection } from 'modules/collection/selectors'
import { getCollectionItems, getLoading as getLoadingItem, getPaginationData } from 'modules/item/selectors'
import { FETCH_COLLECTION_ITEMS_REQUEST } from 'modules/item/actions'
import { FETCH_COLLECTIONS_REQUEST, DELETE_COLLECTION_REQUEST } from 'modules/collection/actions'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { getCollectionThirdParty, isFetchingAvailableSlots } from 'modules/thirdParty/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './ThirdPartyCollectionDetailPage.types'
import CollectionDetailPage from './ThirdPartyCollectionDetailPage'
import { fetchThirdPartyAvailableSlotsRequest } from 'modules/thirdParty/actions'
import { getCollectionType } from 'modules/collection/utils'
import { CollectionType } from 'modules/collection/types'

const mapState = (state: RootState): MapStateProps => {
  const collectionId = getCollectionId() || ''
  const collection = getCollection(state, collectionId)
  const totalItems = getPaginationData(state, collectionId)?.total || null
  const items = collection ? getCollectionItems(state, collection.id) : []
  const paginatedData = (collection && getPaginationData(state, collection.id)) || null
  const queryParams = new URLSearchParams(window.location.search)
  const currentPage = Number(queryParams.get('page') ?? 1)
  return {
    items,
    totalItems,
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
      isLoadingType(getLoadingItem(state), FETCH_COLLECTION_ITEMS_REQUEST),
    isLoadingAvailableSlots: isFetchingAvailableSlots(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onFetchAvailableSlots: (thirdPartyId: string) => dispatch(fetchThirdPartyAvailableSlotsRequest(thirdPartyId))
})

export default connect(mapState, mapDispatch)(CollectionDetailPage)
