import { Dispatch } from 'redux'
import { Color4 } from 'decentraland-ecs'
import {
  closeEditor,
  CloseEditorAction,
  setAvatarAnimation,
  SetAvatarAnimationAction,
  setBodyShape,
  SetBodyShapeAction,
  setSkinColor,
  SetSkinColorAction,
  setEyeColor,
  SetEyeColorAction,
  setHairColor,
  SetHairColorAction
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
  onSetSkinColor: typeof setSkinColor
  onSetEyeColor: typeof setEyeColor
  onSetHairColor: typeof setHairColor
  onClose: typeof closeEditor
}

export type MapStateProps = Pick<Props, 'bodyShape' | 'skinColor' | 'eyeColor' | 'hairColor' | 'avatarAnimation' | 'visibleItems'>
export type MapDispatchProps = Pick<
  Props,
  'onClose' | 'onSetBodyShape' | 'onSetAvatarAnimation' | 'onSetSkinColor' | 'onSetEyeColor' | 'onSetHairColor'
>
export type MapDispatch = Dispatch<
  CloseEditorAction | SetBodyShapeAction | SetAvatarAnimationAction | SetSkinColorAction | SetEyeColorAction | SetHairColorAction
>
