import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { closeEditor, setAvatarAnimation, setBodyShape } from 'modules/editor/actions'
import { getAvatarAnimation, getBodyShape, getVisibleItems } from 'modules/editor/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './CenterPanel.types'
import CenterPanel from './CenterPanel'

const mapState = (state: RootState): MapStateProps => ({
  bodyShape: getBodyShape(state),
  avatarAnimation: getAvatarAnimation(state),
  visibleItems: getVisibleItems(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetBodyShape: bodyShape => dispatch(setBodyShape(bodyShape)),
  onSetAvatarAnimation: animation => dispatch(setAvatarAnimation(animation)),
  onClose: () => dispatch(closeEditor())
})

export default connect(mapState, mapDispatch)(CenterPanel)
