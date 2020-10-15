import { Dispatch } from 'redux'
import {
  closeEditor,
  CloseEditorAction,
  setAvatarAnimation,
  SetAvatarAnimationAction,
  setBodyShape,
  SetBodyShapeAction
} from 'modules/editor/actions'
import { AvatarAnimation } from 'modules/editor/types'
import { Item, WearableBodyShape } from 'modules/item/types'

export type Props = {
  bodyShape: WearableBodyShape
  onSetBodyShape: typeof setBodyShape
  avatarAnimation: AvatarAnimation
  onSetAvatarAnimation: typeof setAvatarAnimation
  visibleItems: Item[]
  onClose: typeof closeEditor
}

export type MapStateProps = Pick<Props, 'bodyShape' | 'avatarAnimation' | 'visibleItems'>
export type MapDispatchProps = Pick<Props, 'onClose' | 'onSetBodyShape' | 'onSetAvatarAnimation'>
export type MapDispatch = Dispatch<CloseEditorAction | SetBodyShapeAction | SetAvatarAnimationAction>
