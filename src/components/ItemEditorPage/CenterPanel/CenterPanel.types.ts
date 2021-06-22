import { Dispatch } from 'redux'
import { Color4, Wearable } from 'decentraland-ecs'
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
  SetHairColorAction,
  setBaseWearable,
  SetBaseWearableAction
} from 'modules/editor/actions'
import { AvatarAnimation } from 'modules/editor/types'
import { Item, WearableBodyShape, WearableCategory } from 'modules/item/types'

export type Props = {
  bodyShape: WearableBodyShape
  skinColor: Color4
  eyeColor: Color4
  hairColor: Color4
  avatarAnimation: AvatarAnimation
  baseWearables: Record<WearableCategory, Wearable | null>
  visibleItems: Item[]
  onSetBodyShape: typeof setBodyShape
  onSetAvatarAnimation: typeof setAvatarAnimation
  onSetSkinColor: typeof setSkinColor
  onSetEyeColor: typeof setEyeColor
  onSetHairColor: typeof setHairColor
  onSetBaseWearable: typeof setBaseWearable
  onClose: typeof closeEditor
}

export type State = {
  isShowingAvatarAttributes: boolean
}

export type MapStateProps = Pick<
  Props,
  'bodyShape' | 'skinColor' | 'eyeColor' | 'hairColor' | 'avatarAnimation' | 'visibleItems' | 'baseWearables'
>
export type MapDispatchProps = Pick<
  Props,
  'onClose' | 'onSetBodyShape' | 'onSetAvatarAnimation' | 'onSetSkinColor' | 'onSetEyeColor' | 'onSetHairColor' | 'onSetBaseWearable'
>
export type MapDispatch = Dispatch<
  | CloseEditorAction
  | SetBodyShapeAction
  | SetAvatarAnimationAction
  | SetSkinColorAction
  | SetEyeColorAction
  | SetHairColorAction
  | SetBaseWearableAction
>
