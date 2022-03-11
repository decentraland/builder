import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getData as getWallet } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { getData as getAuthorizations } from 'decentraland-dapps/dist/modules/authorization/selectors'
import { RootState } from 'modules/common/types'
import { getThirdPartyCollectionId } from 'modules/location/selectors'
import { getCollection, getLoading as getLoadingCollection } from 'modules/collection/selectors'
import { getCollectionItems, getLoading as getLoadingItem } from 'modules/item/selectors'
import { FETCH_COLLECTIONS_REQUEST, DELETE_COLLECTION_REQUEST } from 'modules/collection/actions'
import { openModal } from 'modules/modal/actions'
import { FETCH_ITEMS_REQUEST } from 'modules/item/actions'
import { getCollectionThirdParty, isFetchingAvailableSlots } from 'modules/thirdParty/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './ThirdPartyCollectionDetailPage.types'
import CollectionDetailPage from './ThirdPartyCollectionDetailPage'
import { fetchThirdPartyAvailableSlotsRequest } from 'modules/thirdParty/actions'
import { getCollectionType } from 'modules/collection/utils'
import { CollectionType } from 'modules/collection/types'

const mapState = (state: RootState): MapStateProps => {
  const collectionId = getThirdPartyCollectionId(state) || ''
  const collection = getCollection(state, collectionId)
  return {
    wallet: getWallet(state)!,
    collection,
    thirdParty:
      collection && getCollectionType(collection) === CollectionType.THIRD_PARTY ? getCollectionThirdParty(state, collection) : null,
    authorizations: getAuthorizations(state),
    items: getCollectionItems(state, collectionId),
    isLoading:
      isLoadingType(getLoadingCollection(state), FETCH_COLLECTIONS_REQUEST) ||
      isLoadingType(getLoadingCollection(state), DELETE_COLLECTION_REQUEST) ||
      isLoadingType(getLoadingItem(state), FETCH_ITEMS_REQUEST),
    isLoadingAvailableSlots: isFetchingAvailableSlots(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onFetchAvailableSlots: (thirdPartyId: string) => dispatch(fetchThirdPartyAvailableSlotsRequest(thirdPartyId))
})

export default connect(mapState, mapDispatch)(CollectionDetailPage)
