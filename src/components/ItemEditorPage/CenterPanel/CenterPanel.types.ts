import { Dispatch } from 'redux'
import {
  closeEditor,
  CloseEditorAction,
  setAvatarAnimation,
  SetAvatarAnimationAction,
  setBodyShape,
  SetBodyShapeAction,
  setAvatarColor,
  SetAvatarColorAction
} from 'modules/editor/actions'
import { AvatarAnimation } from 'modules/editor/types'
import { Item, WearableBodyShape } from 'modules/item/types'

export type Props = {
  bodyShape: WearableBodyShape
  onSetBodyShape: typeof setBodyShape
  avatarAnimation: AvatarAnimation
  onSetAvatarAnimation: typeof setAvatarAnimation
  onSetAvatarColor: typeof setAvatarColor
  visibleItems: Item[]
  onClose: typeof closeEditor
}

export type MapStateProps = Pick<Props, 'bodyShape' | 'avatarAnimation' | 'visibleItems'>
export type MapDispatchProps = Pick<Props, 'onClose' | 'onSetBodyShape' | 'onSetAvatarAnimation' | 'onSetAvatarColor'>
export type MapDispatch = Dispatch<CloseEditorAction | SetBodyShapeAction | SetAvatarAnimationAction | SetAvatarColorAction>
