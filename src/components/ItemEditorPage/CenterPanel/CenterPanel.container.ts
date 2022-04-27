import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import {
  setEmote,
  setBaseWearable,
  setBodyShape,
  setEyeColor,
  setHairColor,
  setSkinColor,
  fetchBaseWearablesRequest
} from 'modules/editor/actions'
import {
  getEmote,
  getSelectedBaseWearablesByBodyShape,
  getBodyShape,
  getEyeColor,
  getHairColor,
  getSkinColor,
  getVisibleItems
} from 'modules/editor/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './CenterPanel.types'
import CenterPanel from './CenterPanel'

const mapState = (state: RootState): MapStateProps => {
  const bodyShape = getBodyShape(state)
  const selectedBaseWearablesByBodyShape = getSelectedBaseWearablesByBodyShape(state)
  return {
    bodyShape,
    selectedBaseWearables: selectedBaseWearablesByBodyShape ? selectedBaseWearablesByBodyShape[bodyShape] : null,
    skinColor: getSkinColor(state),
    eyeColor: getEyeColor(state),
    hairColor: getHairColor(state),
    emote: getEmote(state),
    visibleItems: getVisibleItems(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetBodyShape: bodyShape => dispatch(setBodyShape(bodyShape)),
  onSetAvatarAnimation: animation => dispatch(setEmote(animation)),
  onSetSkinColor: color => dispatch(setSkinColor(color)),
  onSetEyeColor: color => dispatch(setEyeColor(color)),
  onSetHairColor: color => dispatch(setHairColor(color)),
  onSetBaseWearable: (category, bodyShape, wearable) => dispatch(setBaseWearable(category, bodyShape, wearable)),
  onFetchBaseWearables: () => dispatch(fetchBaseWearablesRequest())
})

export default connect(mapState, mapDispatch)(CenterPanel)
