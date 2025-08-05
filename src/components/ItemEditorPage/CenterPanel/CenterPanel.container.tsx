import React, { useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { PreviewEmote } from '@dcl/schemas'
import { getOpenModals } from 'decentraland-dapps/dist/modules/modal/selectors'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { getCollections } from 'modules/collection/selectors'
import {
  setEmote,
  setBaseWearable,
  setBodyShape,
  setEyeColor,
  setHairColor,
  setSkinColor,
  fetchBaseWearablesRequest,
  setWearablePreviewController,
  setItems
} from 'modules/editor/actions'
import {
  getEmote,
  getSelectedBaseWearablesByBodyShape,
  getBodyShape,
  getEyeColor,
  getHairColor,
  getSkinColor,
  getWearablePreviewController,
  isPlayingEmote
} from 'modules/editor/selectors'
import { fetchCollectionItemsRequest, fetchItemsRequest } from 'modules/item/actions'
import { getEmotes, getItem, hasUserOrphanItems } from 'modules/item/selectors'
import { isEmote } from 'modules/item/utils'
import { useGetVisibleItems } from 'modules/editor/hook'
import { useGetSelectedCollectionIdFromCurrentUrl, useGetSelectedItemIdFromCurrentUrl } from 'modules/location/hooks'
import { CenterPanelContainerProps } from './CenterPanel.types'
import CenterPanel from './CenterPanel'

const CenterPanelContainer: React.FC<CenterPanelContainerProps> = () => {
  const dispatch = useDispatch()

  const address = useSelector(getAddress)
  const bodyShape = useSelector(getBodyShape)
  const skinColor = useSelector(getSkinColor)
  const eyeColor = useSelector(getEyeColor)
  const hairColor = useSelector(getHairColor)
  const emote = useSelector(getEmote)
  const selectedBaseWearablesByBodyShape = useSelector(getSelectedBaseWearablesByBodyShape)
  const visibleItems = useGetVisibleItems()
  const wearableController = useSelector(getWearablePreviewController)
  const allEmotes = useSelector(getEmotes)
  const isEmotePlaying = useSelector(isPlayingEmote)
  const openModals = useSelector(getOpenModals)
  const userHasOrphanItems = useSelector(hasUserOrphanItems)
  const collections = useSelector(getCollections)

  const collectionId = useGetSelectedCollectionIdFromCurrentUrl()
  const selectedItemId = useGetSelectedItemIdFromCurrentUrl()

  const selectedItem = useSelector((state: RootState) => (selectedItemId ? getItem(state, selectedItemId) : null))
  const collection = useMemo(
    () => (collectionId ? collections.find(collection => collection.id === collectionId) : undefined),
    [collections, collectionId]
  )
  const emotes = useMemo(
    () => (collectionId ? allEmotes.filter(emote => emote.collectionId === collectionId) : allEmotes.filter(emote => !emote.collectionId)),
    [allEmotes, collectionId]
  )
  const selectedBaseWearables = selectedBaseWearablesByBodyShape ? selectedBaseWearablesByBodyShape[bodyShape] : null
  const isPLayingIdleEmote = useMemo(() => !visibleItems.some(isEmote) && emote === PreviewEmote.IDLE, [visibleItems, emote])
  const isPlayingEmoteState = isPLayingIdleEmote ? false : isEmotePlaying

  /* The library react-dropzone doesn't work as expected when an Iframe is present in the current view.
     This way, we're getting when the CreateSingleItemModal is open to disable the drag and drop events in the Iframe
     and the library react-dropzone works as expected in the CreateSingleItemModal.
  */
  const isImportFilesModalOpen = 'CreateSingleItemModal' in openModals

  const actions = useMemo(
    () => ({
      onSetBodyShape: (bodyShape: Parameters<typeof setBodyShape>[0]) => {
        dispatch(setBodyShape(bodyShape))
      },
      onSetAvatarAnimation: (emote: Parameters<typeof setEmote>[0]) => {
        dispatch(setEmote(emote))
      },
      onSetSkinColor: (skinColor: Parameters<typeof setSkinColor>[0]) => {
        dispatch(setSkinColor(skinColor))
      },
      onSetEyeColor: (eyeColor: Parameters<typeof setEyeColor>[0]) => {
        dispatch(setEyeColor(eyeColor))
      },
      onSetHairColor: (hairColor: Parameters<typeof setHairColor>[0]) => {
        dispatch(setHairColor(hairColor))
      },
      onSetBaseWearable: (
        category: Parameters<typeof setBaseWearable>[0],
        bodyShape: Parameters<typeof setBaseWearable>[1],
        wearable: Parameters<typeof setBaseWearable>[2]
      ) => {
        dispatch(setBaseWearable(category, bodyShape, wearable))
      },
      onFetchBaseWearables: () => {
        dispatch(fetchBaseWearablesRequest())
      },
      onSetWearablePreviewController: (controller: Parameters<typeof setWearablePreviewController>[0]) => {
        dispatch(setWearablePreviewController(controller))
      },
      onSetItems: (items: Parameters<typeof setItems>[0]) => {
        dispatch(setItems(items))
      },
      onFetchOrphanItems: (address: Parameters<typeof fetchItemsRequest>[0], params?: Parameters<typeof fetchItemsRequest>[1]) => {
        dispatch(fetchItemsRequest(address, params))
      },
      onFetchCollectionItems: (
        id: Parameters<typeof fetchCollectionItemsRequest>[0],
        params?: Parameters<typeof fetchCollectionItemsRequest>[1]
      ) => {
        dispatch(fetchCollectionItemsRequest(id, params))
      }
    }),
    [dispatch]
  )

  return (
    <CenterPanel
      address={address}
      bodyShape={bodyShape}
      collection={collection}
      selectedItem={selectedItem}
      selectedBaseWearables={selectedBaseWearables}
      skinColor={skinColor}
      eyeColor={eyeColor}
      hairColor={hairColor}
      emote={emote}
      visibleItems={visibleItems}
      wearableController={wearableController}
      emotes={emotes}
      isPlayingEmote={isPlayingEmoteState}
      isImportFilesModalOpen={isImportFilesModalOpen}
      hasUserOrphanItems={userHasOrphanItems}
      {...actions}
    />
  )
}

export default CenterPanelContainer
