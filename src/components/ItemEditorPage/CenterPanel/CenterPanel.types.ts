import { Dispatch } from 'redux'
import { Color4 } from 'decentraland-ecs'
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
  skinColor: Color4
  eyeColor: Color4
  hairColor: Color4
  avatarAnimation: AvatarAnimation
  visibleItems: Item[]
  onSetBodyShape: typeof setBodyShape
  onSetAvatarAnimation: typeof setAvatarAnimation
  onSetAvatarColor: typeof setAvatarColor
  onClose: typeof closeEditor
}

export type MapStateProps = Pick<Props, 'bodyShape' | 'skinColor' | 'eyeColor' | 'hairColor' | 'avatarAnimation' | 'visibleItems'>
export type MapDispatchProps = Pick<Props, 'onClose' | 'onSetBodyShape' | 'onSetAvatarAnimation' | 'onSetAvatarColor'>
export type MapDispatch = Dispatch<CloseEditorAction | SetBodyShapeAction | SetAvatarAnimationAction | SetAvatarColorAction>
