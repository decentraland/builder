import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import {
  closeEditor,
  setAvatarAnimation,
  setBaseWearable,
  setBodyShape,
  setEyeColor,
  setHairColor,
  setSkinColor
} from 'modules/editor/actions'
import {
  getAvatarAnimation,
  getBaseWearables,
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
  const baseWearables = getBaseWearables(state)
  return {
    bodyShape,
    baseWearables: baseWearables[bodyShape],
    skinColor: getSkinColor(state),
    eyeColor: getEyeColor(state),
    hairColor: getHairColor(state),
    avatarAnimation: getAvatarAnimation(state),
    visibleItems: getVisibleItems(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetBodyShape: bodyShape => dispatch(setBodyShape(bodyShape)),
  onSetAvatarAnimation: animation => dispatch(setAvatarAnimation(animation)),
  onSetSkinColor: color => dispatch(setSkinColor(color)),
  onSetEyeColor: color => dispatch(setEyeColor(color)),
  onSetHairColor: color => dispatch(setHairColor(color)),
  onSetBaseWearable: (category, bodyShape, wearable) => dispatch(setBaseWearable(category, bodyShape, wearable)),
  onClose: () => dispatch(closeEditor())
})

export default connect(mapState, mapDispatch)(CenterPanel)
