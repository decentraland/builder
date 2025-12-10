import React, { useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { PreviewEmote } from '@dcl/schemas'
import { RootState } from 'modules/common/types'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { isConnected, getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import {
  useGetSelectedCollectionIdFromCurrentUrl,
  useGetSelectedItemIdFromCurrentUrl,
  useGetIsReviewingFromCurrentUrl
} from 'modules/location/hooks'
import { getBodyShape, getWearablePreviewController, isPlayingEmote } from 'modules/editor/selectors'
import { useGetVisibleItems } from 'modules/editor/hook'
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
import { setEmote, setItems } from 'modules/editor/actions'
import { fetchItemsRequest, fetchOrphanItemRequest, FETCH_ITEMS_REQUEST, FETCH_ORPHAN_ITEM_REQUEST } from 'modules/item/actions'
import { LeftPanelContainerProps } from './LeftPanel.types'
import LeftPanel from './LeftPanel'

const LeftPanelContainer: React.FC<LeftPanelContainerProps> = props => {
  const dispatch = useDispatch()
  const selectedCollectionId = useGetSelectedCollectionIdFromCurrentUrl()
  const selectedItemId = useGetSelectedItemIdFromCurrentUrl()
  const isReviewing = useGetIsReviewingFromCurrentUrl()
  const visibleItems = useGetVisibleItems()

  const address = useSelector((state: RootState) => getAddress(state))
  const isConnectedValue = useSelector((state: RootState) => isConnected(state))
  const items = useSelector((state: RootState) => getItems(state))
  const collections = useSelector((state: RootState) => getAuthorizedCollections(state))
  const bodyShape = useSelector((state: RootState) => getBodyShape(state))
  const wearableController = useSelector((state: RootState) => getWearablePreviewController(state))
  const isPlayingEmoteValue = useSelector((state: RootState) => isPlayingEmote(state))
  const hasUserOrphanItemsValue = useSelector((state: RootState) => hasUserOrphanItems(state))
  const loading = useSelector((state: RootState) => getLoading(state))

  const selectedItem = useSelector((state: RootState) => (selectedItemId ? getItem(state, selectedItemId) : null))
  const itemsPaginationData = useSelector((state: RootState) => {
    if (selectedCollectionId) {
      return getPaginationData(state, selectedCollectionId)
    }
    if (address) {
      return getPaginationData(state, address)
    }
    return undefined
  })
  const collectionsPaginationData = useSelector((state: RootState) =>
    !selectedCollectionId ? getCollectionsPaginationData(state) : undefined
  )
  const orphanItems = useSelector((state: RootState) => {
    if (address && !selectedCollectionId) {
      return getPaginatedWalletOrphanItems(state, address, itemsPaginationData?.limit)
    }
    return getWalletOrphanItems(state)
  })
  const isLoading = useMemo(
    () => isLoadingType(loading, FETCH_ITEMS_REQUEST) || isLoadingType(loading, FETCH_ORPHAN_ITEM_REQUEST),
    [loading]
  )

  const onSetItems: ActionFunction<typeof setItems> = useCallback(items => dispatch(setItems(items)), [dispatch])
  const onFetchCollections: ActionFunction<typeof fetchCollectionsRequest> = useCallback(
    (address, params) => dispatch(fetchCollectionsRequest(address, params)),
    [dispatch]
  )
  const onFetchOrphanItems: ActionFunction<typeof fetchItemsRequest> = useCallback(
    (address, params) => dispatch(fetchItemsRequest(address, params)),
    [dispatch]
  )
  const onFetchOrphanItem: ActionFunction<typeof fetchOrphanItemRequest> = useCallback(
    address => dispatch(fetchOrphanItemRequest(address)),
    [dispatch]
  )
  const onResetEmoteToIdle = useCallback(() => dispatch(setEmote(PreviewEmote.IDLE)), [dispatch])

  return (
    <LeftPanel
      {...props}
      address={address}
      isConnected={isConnectedValue}
      items={items}
      totalItems={itemsPaginationData?.total || null}
      totalCollections={collectionsPaginationData?.total || null}
      orphanItems={orphanItems}
      collections={collections}
      selectedItemId={selectedItemId}
      selectedItem={selectedItem}
      selectedCollectionId={selectedCollectionId}
      visibleItems={visibleItems}
      bodyShape={bodyShape}
      wearableController={wearableController}
      isReviewing={isReviewing}
      isLoading={isLoading}
      isPlayingEmote={isPlayingEmoteValue}
      hasUserOrphanItems={hasUserOrphanItemsValue}
      onSetItems={onSetItems}
      onFetchCollections={onFetchCollections}
      onFetchOrphanItems={onFetchOrphanItems}
      onFetchOrphanItem={onFetchOrphanItem}
      onResetEmoteToIdle={onResetEmoteToIdle}
    />
  )
}

export default LeftPanelContainer
