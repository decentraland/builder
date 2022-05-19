import { Dispatch } from 'redux'
import { Color4, Wearable } from 'decentraland-ecs'
import { PreviewEmote, WearableBodyShape, WearableCategory } from '@dcl/schemas'
import {
  CloseEditorAction,
  setEmote,
  SetEmoteAction,
  setBodyShape,
  SetBodyShapeAction,
  setSkinColor,
  SetSkinColorAction,
  setEyeColor,
  SetEyeColorAction,
  setHairColor,
  SetHairColorAction,
  setBaseWearable,
  SetBaseWearableAction,
  fetchBaseWearablesRequest,
  FetchBaseWearablesRequestAction
} from 'modules/editor/actions'
import { Item } from 'modules/item/types'

export type Props = {
  bodyShape: WearableBodyShape
  skinColor: Color4
  eyeColor: Color4
  hairColor: Color4
  emote: PreviewEmote
  selectedBaseWearables: Record<WearableCategory, Wearable | null> | null
  visibleItems: Item[]
  onSetBodyShape: typeof setBodyShape
  onSetAvatarAnimation: typeof setEmote
  onSetSkinColor: typeof setSkinColor
  onSetEyeColor: typeof setEyeColor
  onSetHairColor: typeof setHairColor
  onSetBaseWearable: typeof setBaseWearable
  onFetchBaseWearables: typeof fetchBaseWearablesRequest
}

export type State = {
  isShowingAvatarAttributes: boolean
  isLoading: boolean
}

export type MapStateProps = Pick<
  Props,
  'bodyShape' | 'skinColor' | 'eyeColor' | 'hairColor' | 'emote' | 'visibleItems' | 'selectedBaseWearables'
>
export type MapDispatchProps = Pick<
  Props,
  | 'onSetBodyShape'
  | 'onSetAvatarAnimation'
  | 'onSetSkinColor'
  | 'onSetEyeColor'
  | 'onSetHairColor'
  | 'onSetBaseWearable'
  | 'onFetchBaseWearables'
>
export type MapDispatch = Dispatch<
  | CloseEditorAction
  | SetBodyShapeAction
  | SetEmoteAction
  | SetSkinColorAction
  | SetEyeColorAction
  | SetHairColorAction
  | SetBaseWearableAction
  | FetchBaseWearablesRequestAction
>
