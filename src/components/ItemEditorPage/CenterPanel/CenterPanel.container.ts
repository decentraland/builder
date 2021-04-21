import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { closeEditor, setAvatarAnimation, setAvatarColor, setBodyShape } from 'modules/editor/actions'
import { getAvatarAnimation, getBodyShape, getEyeColor, getHairColor, getSkinColor, getVisibleItems } from 'modules/editor/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './CenterPanel.types'
import CenterPanel from './CenterPanel'

const mapState = (state: RootState): MapStateProps => ({
  bodyShape: getBodyShape(state),
  skinColor: getSkinColor(state),
  eyeColor: getEyeColor(state),
  hairColor: getHairColor(state),
  avatarAnimation: getAvatarAnimation(state),
  visibleItems: getVisibleItems(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetBodyShape: bodyShape => dispatch(setBodyShape(bodyShape)),
  onSetAvatarAnimation: animation => dispatch(setAvatarAnimation(animation)),
  onSetAvatarColor: (key, value) => dispatch(setAvatarColor(key, value)),
  onClose: () => dispatch(closeEditor())
})

export default connect(mapState, mapDispatch)(CenterPanel)
