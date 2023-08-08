import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { isConnected, getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { getSelectedCollectionId, getSelectedItemId, isReviewing } from 'modules/location/selectors'
import { getBodyShape, getVisibleItems, getWearablePreviewController, isPlayingEmote } from 'modules/editor/selectors'
import {
  getItem,
  getItems,
  getLoading,
  getPaginatedWalletOrphanItems,
  getPaginationData,
  getWalletOrphanItems,
  hasUserOrphanItems
} from 'modules/item/selectors'
import { fetchCollectionsRequest } from 'modules/collection/actions'
import { getAuthorizedCollections, getPaginationData as getCollectionsPaginationData } from 'modules/collection/selectors'
import { setItems } from 'modules/editor/actions'
import {
  fetchItemsRequest,
  fetchOrphanItemRequest,
  FETCH_ITEMS_REQUEST,
  FETCH_ORPHAN_ITEM_REQUEST,
  setCollection
} from 'modules/item/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './LeftPanel.types'
import LeftPanel from './LeftPanel'

const mapState = (state: RootState): MapStateProps => {
  const selectedCollectionId = getSelectedCollectionId(state)
  const address = getAddress(state)
  const itemsPaginationData = selectedCollectionId
    ? getPaginationData(state, selectedCollectionId)
    : address
    ? getPaginationData(state, address)
    : undefined
  const collectionsPaginationData = !selectedCollectionId ? getCollectionsPaginationData(state) : undefined
  const selectedItemId = getSelectedItemId(state) || ''
  const selectedItem = getItem(state, selectedItemId)

  return {
    address,
    isConnected: isConnected(state),
    items: getItems(state),
    totalItems: itemsPaginationData?.total || null,
    totalCollections: collectionsPaginationData?.total || null,
    orphanItems:
      address && !selectedCollectionId
        ? getPaginatedWalletOrphanItems(state, address, itemsPaginationData?.limit)
        : getWalletOrphanItems(state),
    collections: getAuthorizedCollections(state),
    selectedItemId,
    selectedItem,
    selectedCollectionId,
    visibleItems: getVisibleItems(state),
    bodyShape: getBodyShape(state),
    wearableController: getWearablePreviewController(state),
    isReviewing: isReviewing(state),
    isLoading: isLoadingType(getLoading(state), FETCH_ITEMS_REQUEST) || isLoadingType(getLoading(state), FETCH_ORPHAN_ITEM_REQUEST),
    isPlayingEmote: isPlayingEmote(state),
    hasUserOrphanItems: hasUserOrphanItems(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetItems: items => dispatch(setItems(items)),
  onSetCollection: (item, collectionId) => dispatch(setCollection(item, collectionId)),
  onFetchCollections: (address, params) => dispatch(fetchCollectionsRequest(address, params)),
  onFetchOrphanItems: (address, params) => dispatch(fetchItemsRequest(address, params)),
  onFetchOrphanItem: address => dispatch(fetchOrphanItemRequest(address))
})

export default connect(mapState, mapDispatch)(LeftPanel)
