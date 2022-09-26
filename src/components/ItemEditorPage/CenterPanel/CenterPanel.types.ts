import { Dispatch } from 'redux'
import { Color4, Wearable } from 'decentraland-ecs'
import { BodyShape, IPreviewController, PreviewEmote, WearableCategory } from '@dcl/schemas'
import { Collection } from 'modules/collection/types'
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
  SetWearablePreviewControllerAction,
  SetItemsAction,
  setItems
} from 'modules/editor/actions'
import {
  fetchCollectionItemsRequest,
  FetchCollectionItemsRequestAction,
  fetchItemsRequest,
  FetchItemsRequestAction
} from 'modules/item/actions'
import { Item } from 'modules/item/types'

export type Props = {
  address?: string
  collection: Collection | undefined
  bodyShape: BodyShape
  skinColor: Color4
  eyeColor: Color4
  hairColor: Color4
  emote: PreviewEmote
  selectedBaseWearables: Record<WearableCategory, Wearable | null> | null
  selectedItem: Item | null
  visibleItems: Item[]
  wearableController?: IPreviewController | null
  emotes: Item[]
  isPlayingEmote: boolean
  isImportFilesModalOpen: boolean
  onSetBodyShape: typeof setBodyShape
  onSetAvatarAnimation: typeof setEmote
  onSetSkinColor: typeof setSkinColor
  onSetEyeColor: typeof setEyeColor
  onSetHairColor: typeof setHairColor
  onSetBaseWearable: typeof setBaseWearable
  onFetchBaseWearables: typeof fetchBaseWearablesRequest
  onFetchOrphanItems: typeof fetchItemsRequest
  onFetchCollectionItems: typeof fetchCollectionItemsRequest
  onSetWearablePreviewController: typeof setWearablePreviewController
  onSetItems: typeof setItems
}

export type State = {
  isShowingAvatarAttributes: boolean
  showSceneBoundaries: boolean
  isLoading: boolean
}

export type MapStateProps = Pick<
  Props,
  | 'address'
  | 'bodyShape'
  | 'collection'
  | 'skinColor'
  | 'eyeColor'
  | 'hairColor'
  | 'emote'
  | 'visibleItems'
  | 'selectedBaseWearables'
  | 'selectedItem'
  | 'wearableController'
  | 'emotes'
  | 'isPlayingEmote'
  | 'isImportFilesModalOpen'
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
  | 'onFetchOrphanItems'
  | 'onFetchCollectionItems'
  | 'onSetWearablePreviewController'
  | 'onSetItems'
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
  | FetchItemsRequestAction
  | FetchCollectionItemsRequestAction
  | SetWearablePreviewControllerAction
  | SetItemsAction
>
