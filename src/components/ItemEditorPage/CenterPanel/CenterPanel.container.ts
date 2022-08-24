import { connect } from 'react-redux'
import { PreviewEmote } from '@dcl/schemas'
import { getOpenModals } from 'decentraland-dapps/dist/modules/modal/selectors'
import { RootState } from 'modules/common/types'
import { Collection } from 'modules/collection/types'
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
  getVisibleItems,
  getWearablePreviewController,
  isPlayingEmote
} from 'modules/editor/selectors'
import { getEmotes, getItem } from 'modules/item/selectors'
import { ItemType } from 'modules/item/types'
import { getSelectedCollectionId, getSelectedItemId } from 'modules/location/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './CenterPanel.types'
import CenterPanel from './CenterPanel'

const mapState = (state: RootState): MapStateProps => {
  let collection: Collection | undefined
  const collectionId = getSelectedCollectionId(state)
  // Emotes created by the user
  let emotes = getEmotes(state)
  if (collectionId) {
    const collections = getCollections(state)
    collection = collections.find(collection => collection.id === collectionId)
    emotes = emotes.filter(emote => emote.collectionId === collectionId)
  } else {
    emotes = emotes.filter(emote => !emote.collectionId)
  }
  const selectedItemId = getSelectedItemId(state) || ''
  const selectedItem = getItem(state, selectedItemId)
  const bodyShape = getBodyShape(state)
  const selectedBaseWearablesByBodyShape = getSelectedBaseWearablesByBodyShape(state)
  const visibleItems = getVisibleItems(state)
  const emote = getEmote(state)
  const isPLayingIdleEmote = !visibleItems.some(item => item.type === ItemType.EMOTE) && emote === PreviewEmote.IDLE
  /* The library react-dropzone doesn't work as expected when an Iframe is present in the current view.
     This way, we're getting when the CreateSingleItemModal is open to disable the drag and drop events in the Iframe
     and the library react-dropzone works as expected in the CreateSingleItemModal.
  */
  const isImportFilesModalOpen = 'CreateSingleItemModal' in getOpenModals(state)

  return {
    bodyShape,
    collection,
    selectedItem,
    selectedBaseWearables: selectedBaseWearablesByBodyShape ? selectedBaseWearablesByBodyShape[bodyShape] : null,
    skinColor: getSkinColor(state),
    eyeColor: getEyeColor(state),
    hairColor: getHairColor(state),
    emote,
    visibleItems,
    wearableController: getWearablePreviewController(state),
    emotes,
    isPlayingEmote: isPLayingIdleEmote ? false : isPlayingEmote(state),
    isImportFilesModalOpen
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetBodyShape: bodyShape => dispatch(setBodyShape(bodyShape)),
  onSetAvatarAnimation: animation => dispatch(setEmote(animation)),
  onSetSkinColor: color => dispatch(setSkinColor(color)),
  onSetEyeColor: color => dispatch(setEyeColor(color)),
  onSetHairColor: color => dispatch(setHairColor(color)),
  onSetBaseWearable: (category, bodyShape, wearable) => dispatch(setBaseWearable(category, bodyShape, wearable)),
  onFetchBaseWearables: () => dispatch(fetchBaseWearablesRequest()),
  onSetWearablePreviewController: controller => dispatch(setWearablePreviewController(controller)),
  onSetItems: items => dispatch(setItems(items))
})

export default connect(mapState, mapDispatch)(CenterPanel)
