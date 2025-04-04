import { connect } from 'react-redux'
import { getLocation } from 'connected-react-router'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getData as getWallet } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { getData as getAuthorizations } from 'decentraland-dapps/dist/modules/authorization/selectors'
import { RootState } from 'modules/common/types'
import { getCollectionId } from 'modules/location/selectors'
import { getCollection, getLoading as getLoadingCollection } from 'modules/collection/selectors'
import { getCollectionItems, getPaginationData } from 'modules/item/selectors'
import { DELETE_COLLECTION_REQUEST } from 'modules/collection/actions'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { getCollectionThirdParty, isFetchingAvailableSlots, isLoadingThirdParties, isLoadingThirdParty } from 'modules/thirdParty/selectors'
import { fetchThirdPartyAvailableSlotsRequest, fetchThirdPartyRequest } from 'modules/thirdParty/actions'
import { isThirdPartyCollection } from 'modules/collection/utils'
import { Collection } from 'modules/collection/types'
import { getIsLinkedWearablesPaymentsEnabled, getIsLinkedWearablesV2Enabled } from 'modules/features/selectors'
import { getLastLocation } from 'modules/ui/location/selector'
import { MapStateProps, MapDispatchProps, MapDispatch } from './ThirdPartyCollectionDetailPage.types'
import CollectionDetailPage from './ThirdPartyCollectionDetailPage'
import { extractThirdPartyId } from 'lib/urn'

const mapState = (state: RootState): MapStateProps => {
  const collectionId = getCollectionId(state) || ''
  const collection = getCollection(state, collectionId)
  const isThirdParty = collection ? isThirdPartyCollection(collection) : false
  const totalItems = getPaginationData(state, collectionId)?.total || null
  const items = collection ? getCollectionItems(state, collection.id) : []
  const paginatedData = (collection && getPaginationData(state, collection.id)) || null
  const currentPage = Number(getLocation(state).query.page ?? 1)
  return {
    items,
    totalItems,
    currentPage,
    paginatedData,
    wallet: getWallet(state)!,
    collection,
    isThirdPartyV2Enabled: getIsLinkedWearablesV2Enabled(state),
    isLinkedWearablesPaymentsEnabled: getIsLinkedWearablesPaymentsEnabled(state),
    thirdParty: collection && isThirdPartyCollection(collection) ? getCollectionThirdParty(state, collection) : null,
    authorizations: getAuthorizations(state),
    isLoading:
      isLoadingType(getLoadingCollection(state), DELETE_COLLECTION_REQUEST) ||
      isLoadingThirdParties(state) ||
      !!(isThirdParty && collection && isLoadingThirdParty(state, extractThirdPartyId(collection.urn))),
    isLoadingAvailableSlots: isFetchingAvailableSlots(state),
    lastLocation: getLastLocation(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNewItem: (collectionId: string) => dispatch(openModal('CreateItemsModal', { collectionId })),
  onEditName: (collection: Collection) => dispatch(openModal('EditCollectionNameModal', { collection })),
  onFetchAvailableSlots: (thirdPartyId: string) => dispatch(fetchThirdPartyAvailableSlotsRequest(thirdPartyId)),
  onFetchThirdParty: (thirdPartyId: string) => dispatch(fetchThirdPartyRequest(thirdPartyId))
})

export default connect(mapState, mapDispatch)(CollectionDetailPage)
