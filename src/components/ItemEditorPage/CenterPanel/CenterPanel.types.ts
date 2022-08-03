import { Dispatch } from 'redux'
import { Color4, Wearable } from 'decentraland-ecs'
import { BodyShape, IPreviewController, PreviewEmote, WearableCategory } from '@dcl/schemas'
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
  FetchBaseWearablesRequestAction,
  setWearablePreviewController,
  SetWearablePreviewControllerAction
} from 'modules/editor/actions'
import { Item } from 'modules/item/types'

export type Props = {
  bodyShape: BodyShape
  skinColor: Color4
  eyeColor: Color4
  hairColor: Color4
  emote: PreviewEmote
  selectedBaseWearables: Record<WearableCategory, Wearable | null> | null
  visibleItems: Item[]
  wearableController?: IPreviewController | null
  onSetBodyShape: typeof setBodyShape
  onSetAvatarAnimation: typeof setEmote
  onSetSkinColor: typeof setSkinColor
  onSetEyeColor: typeof setEyeColor
  onSetHairColor: typeof setHairColor
  onSetBaseWearable: typeof setBaseWearable
  onFetchBaseWearables: typeof fetchBaseWearablesRequest
  onSetWearablePreviewController: typeof setWearablePreviewController
}

export type State = {
  isShowingAvatarAttributes: boolean
  isLoading: boolean
}

export type MapStateProps = Pick<
  Props,
  'bodyShape' | 'skinColor' | 'eyeColor' | 'hairColor' | 'emote' | 'visibleItems' | 'selectedBaseWearables' | 'wearableController'
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
  | 'onSetWearablePreviewController'
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
  | SetWearablePreviewControllerAction
>
