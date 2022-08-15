import { connect } from 'react-redux'
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
  getWearablePreviewController
} from 'modules/editor/selectors'
import { getSelectedCollectionId, getSelectedItemId } from 'modules/location/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './CenterPanel.types'
import CenterPanel from './CenterPanel'
import { getEmotes, getItem } from 'modules/item/selectors'

const mapState = (state: RootState): MapStateProps => {
  let collection: Collection | undefined
  const collectionId = getSelectedCollectionId(state)
  if (collectionId) {
    const collections = getCollections(state)
    collection = collections.find(collection => collection.id === collectionId)
  }
  const selectedItemId = getSelectedItemId(state) || ''
  const selectedItem = getItem(state, selectedItemId)
  const bodyShape = getBodyShape(state)
  const selectedBaseWearablesByBodyShape = getSelectedBaseWearablesByBodyShape(state)

  return {
    bodyShape,
    collection,
    selectedItem,
    selectedBaseWearables: selectedBaseWearablesByBodyShape ? selectedBaseWearablesByBodyShape[bodyShape] : null,
    skinColor: getSkinColor(state),
    eyeColor: getEyeColor(state),
    hairColor: getHairColor(state),
    emote: getEmote(state),
    visibleItems: getVisibleItems(state),
    wearableController: getWearablePreviewController(state),
    emotesFromCollection: getEmotes(state)
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
