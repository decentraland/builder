import type { Wearable } from 'decentraland-ecs'
import { BodyShape, IPreviewController, PreviewEmote, WearableCategory } from '@dcl/schemas'
import { SocialEmoteAnimation } from 'decentraland-ui2/dist/components/WearablePreview/WearablePreview.types'
import { Collection } from 'modules/collection/types'
import {
  setEmote,
  setBodyShape,
  setSkinColor,
  setEyeColor,
  setHairColor,
  setBaseWearable,
  setWearablePreviewController,
  setItems,
  fetchBaseWearablesRequest
} from 'modules/editor/actions'
import { fetchCollectionItemsRequest, fetchItemsRequest } from 'modules/item/actions'
import { Item } from 'modules/item/types'
import { Color4 } from 'lib/colors'

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
  hasUserOrphanItems: boolean | undefined
  onSetBodyShape: ActionFunction<typeof setBodyShape>
  onSetAvatarAnimation: ActionFunction<typeof setEmote>
  onSetSkinColor: ActionFunction<typeof setSkinColor>
  onSetEyeColor: ActionFunction<typeof setEyeColor>
  onSetHairColor: ActionFunction<typeof setHairColor>
  onSetBaseWearable: ActionFunction<typeof setBaseWearable>
  onFetchBaseWearables: ActionFunction<typeof fetchBaseWearablesRequest>
  onFetchOrphanItems: ActionFunction<typeof fetchItemsRequest>
  onFetchCollectionItems: ActionFunction<typeof fetchCollectionItemsRequest>
  onSetWearablePreviewController: (controller: Parameters<typeof setWearablePreviewController>[0]) => void
  onSetItems: (items: Parameters<typeof setItems>[0]) => void
}

export type CenterPanelContainerProps = Record<string, never>

export type State = {
  isShowingAvatarAttributes: boolean
  showSceneBoundaries: boolean
  isLoading: boolean
  socialEmote?: SocialEmoteAnimation
}
