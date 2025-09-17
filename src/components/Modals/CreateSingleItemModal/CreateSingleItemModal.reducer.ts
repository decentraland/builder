import { AnimationClip, Object3D } from 'three'
import { EmotePlayMode, Rarity, WearableCategory, Mapping, ContractNetwork, ContractAddress } from '@dcl/schemas'
import { Item, BodyShapeType, ItemType, OutcomeGroup } from 'modules/item/types'
import { Metrics } from 'modules/models/types'
import { CreateItemView, State, AcceptedFileProps, CreateSingleItemModalMetadata } from './CreateSingleItemModal.types'
import { Collection } from 'modules/collection/types'
import { getBodyShapeType, getMissingBodyShapeType } from 'modules/item/utils'
import { getDefaultMappings, getLinkedContract } from './utils'

// Initial State Creation
export const createInitialState = (
  metadata: CreateSingleItemModalMetadata | null,
  collection: Collection | null,
  isThirdPartyV2Enabled: boolean
): State => {
  const state: State = {
    view: CreateItemView.IMPORT,
    playMode: EmotePlayMode.SIMPLE,
    weareblePreviewUpdated: false,
    hasScreenshotTaken: false
  }

  if (!metadata) {
    return state
  }

  const { collectionId, item, addRepresentation } = metadata
  state.collectionId = collectionId
  const contract = collection ? getLinkedContract(collection) : undefined

  if (item) {
    state.id = item.id
    state.name = item.name
    state.description = item.description
    state.item = item
    state.type = item.type
    state.collectionId = item.collectionId
    state.bodyShape = getBodyShapeType(item)
    state.category = item.data.category
    state.rarity = item.rarity
    state.isRepresentation = false
    state.mappings = item.mappings ?? getDefaultMappings(contract, isThirdPartyV2Enabled)

    if (addRepresentation) {
      const missingBodyShape = getMissingBodyShapeType(item)
      if (missingBodyShape) {
        state.bodyShape = missingBodyShape
        state.isRepresentation = true
      }
    }
  } else {
    state.mappings = getDefaultMappings(contract, isThirdPartyV2Enabled)
  }

  return state
}

// Action Types
export const CREATE_ITEM_ACTIONS = {
  SET_VIEW: 'SET_VIEW',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_THUMBNAIL: 'SET_THUMBNAIL',
  SET_VIDEO: 'SET_VIDEO',
  SET_CONTENTS: 'SET_CONTENTS',
  SET_METRICS: 'SET_METRICS',
  SET_MODEL_SIZE: 'SET_MODEL_SIZE',
  // SET_PREVIEW_CONTROLLER: 'SET_PREVIEW_CONTROLLER',
  SET_ITEM: 'SET_ITEM',
  SET_COLLECTION_ID: 'SET_COLLECTION_ID',
  SET_BODY_SHAPE: 'SET_BODY_SHAPE',
  SET_CATEGORY: 'SET_CATEGORY',
  SET_RARITY: 'SET_RARITY',
  SET_PLAY_MODE: 'SET_PLAY_MODE',
  SET_TYPE: 'SET_TYPE',
  SET_NAME: 'SET_NAME',
  SET_DESCRIPTION: 'SET_DESCRIPTION',
  SET_IS_REPRESENTATION: 'SET_IS_REPRESENTATION',
  SET_MAPPINGS: 'SET_MAPPINGS',
  SET_REQUIRED_PERMISSIONS: 'SET_REQUIRED_PERMISSIONS',
  SET_OUTCOMES: 'SET_OUTCOMES',
  SET_EMOTE_DATA: 'SET_EMOTE_DATA',
  SET_TAGS: 'SET_TAGS',
  SET_BLOCK_VRM_EXPORT: 'SET_BLOCK_VRM_EXPORT',
  SET_HAS_SCREENSHOT_TAKEN: 'SET_HAS_SCREENSHOT_TAKEN',
  SET_WEARABLE_PREVIEW_UPDATED: 'SET_WEARABLE_PREVIEW_UPDATED',
  SET_ITEM_SORTED_CONTENTS: 'SET_ITEM_SORTED_CONTENTS',
  SET_FROM_VIEW: 'SET_FROM_VIEW',
  SET_MODEL: 'SET_MODEL',
  SET_VIDEO_PREVIEW: 'SET_VIDEO_PREVIEW',
  SET_ACCEPTED_PROPS: 'SET_ACCEPTED_PROPS',
  RESET_STATE: 'RESET_STATE',
  UPDATE_THUMBNAIL_BY_CATEGORY: 'UPDATE_THUMBNAIL_BY_CATEGORY',
  CLEAR_ERROR: 'CLEAR_ERROR'
} as const

// Action Type Union
export type CreateItemAction =
  | { type: typeof CREATE_ITEM_ACTIONS.SET_VIEW; payload: CreateItemView }
  | { type: typeof CREATE_ITEM_ACTIONS.SET_LOADING; payload: boolean }
  | { type: typeof CREATE_ITEM_ACTIONS.SET_ERROR; payload: string | undefined }
  | { type: typeof CREATE_ITEM_ACTIONS.SET_THUMBNAIL; payload: string }
  | { type: typeof CREATE_ITEM_ACTIONS.SET_VIDEO; payload: string | undefined }
  | { type: typeof CREATE_ITEM_ACTIONS.SET_CONTENTS; payload: Record<string, Blob> }
  | { type: typeof CREATE_ITEM_ACTIONS.SET_METRICS; payload: Metrics }
  | { type: typeof CREATE_ITEM_ACTIONS.SET_MODEL_SIZE; payload: number }
  // | { type: typeof CREATE_ITEM_ACTIONS.SET_PREVIEW_CONTROLLER; payload: any }
  | { type: typeof CREATE_ITEM_ACTIONS.SET_ITEM; payload: Item | undefined }
  | { type: typeof CREATE_ITEM_ACTIONS.SET_COLLECTION_ID; payload: string | undefined }
  | { type: typeof CREATE_ITEM_ACTIONS.SET_BODY_SHAPE; payload: BodyShapeType | undefined }
  | { type: typeof CREATE_ITEM_ACTIONS.SET_CATEGORY; payload: WearableCategory | string }
  | { type: typeof CREATE_ITEM_ACTIONS.SET_RARITY; payload: Rarity }
  | { type: typeof CREATE_ITEM_ACTIONS.SET_PLAY_MODE; payload: EmotePlayMode }
  | { type: typeof CREATE_ITEM_ACTIONS.SET_TYPE; payload: ItemType }
  | { type: typeof CREATE_ITEM_ACTIONS.SET_NAME; payload: string }
  | { type: typeof CREATE_ITEM_ACTIONS.SET_DESCRIPTION; payload: string }
  | { type: typeof CREATE_ITEM_ACTIONS.SET_IS_REPRESENTATION; payload: boolean | undefined }
  | {
      type: typeof CREATE_ITEM_ACTIONS.SET_MAPPINGS
      payload: Partial<Record<ContractNetwork, Record<ContractAddress, Mapping[]>>> | undefined
    }
  | { type: typeof CREATE_ITEM_ACTIONS.SET_REQUIRED_PERMISSIONS; payload: string[] }
  | { type: typeof CREATE_ITEM_ACTIONS.SET_OUTCOMES; payload: OutcomeGroup[] | ((prevOutcomes: OutcomeGroup[]) => OutcomeGroup[]) }
  | { type: typeof CREATE_ITEM_ACTIONS.SET_EMOTE_DATA; payload: { animations: AnimationClip[]; armatures: Object3D[] } }
  | { type: typeof CREATE_ITEM_ACTIONS.SET_TAGS; payload: string[] }
  | { type: typeof CREATE_ITEM_ACTIONS.SET_BLOCK_VRM_EXPORT; payload: boolean }
  | { type: typeof CREATE_ITEM_ACTIONS.SET_HAS_SCREENSHOT_TAKEN; payload: boolean }
  | { type: typeof CREATE_ITEM_ACTIONS.SET_WEARABLE_PREVIEW_UPDATED; payload: boolean }
  | { type: typeof CREATE_ITEM_ACTIONS.SET_ITEM_SORTED_CONTENTS; payload: Record<string, Blob> }
  | { type: typeof CREATE_ITEM_ACTIONS.SET_FROM_VIEW; payload: CreateItemView | undefined }
  | { type: typeof CREATE_ITEM_ACTIONS.SET_MODEL; payload: string }
  | { type: typeof CREATE_ITEM_ACTIONS.SET_VIDEO_PREVIEW; payload: string }
  | { type: typeof CREATE_ITEM_ACTIONS.SET_ACCEPTED_PROPS; payload: Partial<AcceptedFileProps> }
  | { type: typeof CREATE_ITEM_ACTIONS.RESET_STATE; payload: Partial<State> }
  | { type: typeof CREATE_ITEM_ACTIONS.UPDATE_THUMBNAIL_BY_CATEGORY; payload: { thumbnail: string; isLoading: boolean } }
  | { type: typeof CREATE_ITEM_ACTIONS.CLEAR_ERROR }

// Action Creators
export const createItemActions = {
  setView: (view: CreateItemView): CreateItemAction => ({
    type: CREATE_ITEM_ACTIONS.SET_VIEW,
    payload: view
  }),

  setLoading: (isLoading: boolean): CreateItemAction => ({
    type: CREATE_ITEM_ACTIONS.SET_LOADING,
    payload: isLoading
  }),

  setError: (error: string | undefined): CreateItemAction => ({
    type: CREATE_ITEM_ACTIONS.SET_ERROR,
    payload: error
  }),

  setThumbnail: (thumbnail: string): CreateItemAction => ({
    type: CREATE_ITEM_ACTIONS.SET_THUMBNAIL,
    payload: thumbnail
  }),

  setVideo: (video: string | undefined): CreateItemAction => ({
    type: CREATE_ITEM_ACTIONS.SET_VIDEO,
    payload: video
  }),

  setContents: (contents: Record<string, Blob>): CreateItemAction => ({
    type: CREATE_ITEM_ACTIONS.SET_CONTENTS,
    payload: contents
  }),

  setMetrics: (metrics: Metrics): CreateItemAction => ({
    type: CREATE_ITEM_ACTIONS.SET_METRICS,
    payload: metrics
  }),

  setModelSize: (modelSize: number): CreateItemAction => ({
    type: CREATE_ITEM_ACTIONS.SET_MODEL_SIZE,
    payload: modelSize
  }),

  // setPreviewController: (controller: any): CreateItemAction => ({
  //   type: CREATE_ITEM_ACTIONS.SET_PREVIEW_CONTROLLER,
  //   payload: controller
  // }),

  setItem: (item: Item | undefined): CreateItemAction => ({
    type: CREATE_ITEM_ACTIONS.SET_ITEM,
    payload: item
  }),

  setCollectionId: (collectionId: string | undefined): CreateItemAction => ({
    type: CREATE_ITEM_ACTIONS.SET_COLLECTION_ID,
    payload: collectionId
  }),

  setBodyShape: (bodyShape?: BodyShapeType): CreateItemAction => ({
    type: CREATE_ITEM_ACTIONS.SET_BODY_SHAPE,
    payload: bodyShape
  }),

  setCategory: (category: WearableCategory | string): CreateItemAction => ({
    type: CREATE_ITEM_ACTIONS.SET_CATEGORY,
    payload: category
  }),

  setRarity: (rarity: Rarity): CreateItemAction => ({
    type: CREATE_ITEM_ACTIONS.SET_RARITY,
    payload: rarity
  }),

  setPlayMode: (playMode: EmotePlayMode): CreateItemAction => ({
    type: CREATE_ITEM_ACTIONS.SET_PLAY_MODE,
    payload: playMode
  }),

  setType: (type: ItemType): CreateItemAction => ({
    type: CREATE_ITEM_ACTIONS.SET_TYPE,
    payload: type
  }),

  setName: (name: string): CreateItemAction => ({
    type: CREATE_ITEM_ACTIONS.SET_NAME,
    payload: name
  }),

  setDescription: (description: string): CreateItemAction => ({
    type: CREATE_ITEM_ACTIONS.SET_DESCRIPTION,
    payload: description
  }),

  setIsRepresentation: (isRepresentation: boolean | undefined): CreateItemAction => ({
    type: CREATE_ITEM_ACTIONS.SET_IS_REPRESENTATION,
    payload: isRepresentation
  }),

  setMappings: (mappings: Partial<Record<ContractNetwork, Record<ContractAddress, Mapping[]>>> | undefined): CreateItemAction => ({
    type: CREATE_ITEM_ACTIONS.SET_MAPPINGS,
    payload: mappings
  }),

  setRequiredPermissions: (requiredPermissions: string[]): CreateItemAction => ({
    type: CREATE_ITEM_ACTIONS.SET_REQUIRED_PERMISSIONS,
    payload: requiredPermissions
  }),

  setOutcomes: (outcomes: OutcomeGroup[] | ((prevOutcomes: OutcomeGroup[]) => OutcomeGroup[])): CreateItemAction => ({
    type: CREATE_ITEM_ACTIONS.SET_OUTCOMES,
    payload: outcomes
  }),

  setEmoteData: (emoteData: { animations: AnimationClip[]; armatures: Object3D[] }): CreateItemAction => ({
    type: CREATE_ITEM_ACTIONS.SET_EMOTE_DATA,
    payload: emoteData
  }),

  setTags: (tags: string[]): CreateItemAction => ({
    type: CREATE_ITEM_ACTIONS.SET_TAGS,
    payload: tags
  }),

  setBlockVrmExport: (blockVrmExport: boolean): CreateItemAction => ({
    type: CREATE_ITEM_ACTIONS.SET_BLOCK_VRM_EXPORT,
    payload: blockVrmExport
  }),

  setHasScreenshotTaken: (hasScreenshotTaken: boolean): CreateItemAction => ({
    type: CREATE_ITEM_ACTIONS.SET_HAS_SCREENSHOT_TAKEN,
    payload: hasScreenshotTaken
  }),

  setWearablePreviewUpdated: (weareblePreviewUpdated: boolean): CreateItemAction => ({
    type: CREATE_ITEM_ACTIONS.SET_WEARABLE_PREVIEW_UPDATED,
    payload: weareblePreviewUpdated
  }),

  setItemSortedContents: (itemSortedContents: Record<string, Blob>): CreateItemAction => ({
    type: CREATE_ITEM_ACTIONS.SET_ITEM_SORTED_CONTENTS,
    payload: itemSortedContents
  }),

  setFromView: (fromView: CreateItemView | undefined): CreateItemAction => ({
    type: CREATE_ITEM_ACTIONS.SET_FROM_VIEW,
    payload: fromView
  }),

  setModel: (model: string): CreateItemAction => ({
    type: CREATE_ITEM_ACTIONS.SET_MODEL,
    payload: model
  }),

  setVideoPreview: (videoPreview: string): CreateItemAction => ({
    type: CREATE_ITEM_ACTIONS.SET_VIDEO_PREVIEW,
    payload: videoPreview
  }),

  setAcceptedProps: (acceptedProps: Partial<AcceptedFileProps>): CreateItemAction => ({
    type: CREATE_ITEM_ACTIONS.SET_ACCEPTED_PROPS,
    payload: acceptedProps
  }),

  resetState: (resetState: Partial<State>): CreateItemAction => ({
    type: CREATE_ITEM_ACTIONS.RESET_STATE,
    payload: resetState
  }),

  updateThumbnailByCategory: (thumbnail: string, isLoading: boolean): CreateItemAction => ({
    type: CREATE_ITEM_ACTIONS.UPDATE_THUMBNAIL_BY_CATEGORY,
    payload: { thumbnail, isLoading }
  }),

  clearError: (): CreateItemAction => ({
    type: CREATE_ITEM_ACTIONS.CLEAR_ERROR
  })
}

// Reducer function
export const createItemReducer = (state: State, action: CreateItemAction | null): State => {
  switch (action?.type) {
    case CREATE_ITEM_ACTIONS.SET_VIEW:
      return { ...state, view: action.payload }

    case CREATE_ITEM_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload }

    case CREATE_ITEM_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload }

    case CREATE_ITEM_ACTIONS.SET_THUMBNAIL:
      return { ...state, thumbnail: action.payload }

    case CREATE_ITEM_ACTIONS.SET_VIDEO:
      return { ...state, video: action.payload }

    case CREATE_ITEM_ACTIONS.SET_CONTENTS:
      return { ...state, contents: action.payload }

    case CREATE_ITEM_ACTIONS.SET_METRICS:
      return { ...state, metrics: action.payload }

    case CREATE_ITEM_ACTIONS.SET_MODEL_SIZE:
      return { ...state, modelSize: action.payload }

    // case CREATE_ITEM_ACTIONS.SET_PREVIEW_CONTROLLER:
    //   return { ...state, previewController: action.payload }

    case CREATE_ITEM_ACTIONS.SET_ITEM:
      return { ...state, item: action.payload }

    case CREATE_ITEM_ACTIONS.SET_COLLECTION_ID:
      return { ...state, collectionId: action.payload }

    case CREATE_ITEM_ACTIONS.SET_BODY_SHAPE:
      return { ...state, bodyShape: action.payload }

    case CREATE_ITEM_ACTIONS.SET_CATEGORY:
      return { ...state, category: action.payload }

    case CREATE_ITEM_ACTIONS.SET_RARITY:
      return { ...state, rarity: action.payload }

    case CREATE_ITEM_ACTIONS.SET_PLAY_MODE:
      return { ...state, playMode: action.payload }

    case CREATE_ITEM_ACTIONS.SET_TYPE:
      return { ...state, type: action.payload }

    case CREATE_ITEM_ACTIONS.SET_NAME:
      return { ...state, name: action.payload }

    case CREATE_ITEM_ACTIONS.SET_DESCRIPTION:
      return { ...state, description: action.payload }

    case CREATE_ITEM_ACTIONS.SET_IS_REPRESENTATION:
      return { ...state, isRepresentation: action.payload }

    case CREATE_ITEM_ACTIONS.SET_MAPPINGS:
      return { ...state, mappings: action.payload }

    case CREATE_ITEM_ACTIONS.SET_REQUIRED_PERMISSIONS:
      return { ...state, requiredPermissions: action.payload }

    case CREATE_ITEM_ACTIONS.SET_OUTCOMES:
      return {
        ...state,
        outcomes: typeof action.payload === 'function' ? action.payload(state.outcomes || []) : action.payload
      }

    case CREATE_ITEM_ACTIONS.SET_EMOTE_DATA:
      return { ...state, emoteData: action.payload }

    case CREATE_ITEM_ACTIONS.SET_TAGS:
      return { ...state, tags: action.payload }

    case CREATE_ITEM_ACTIONS.SET_BLOCK_VRM_EXPORT:
      return { ...state, blockVrmExport: action.payload }

    case CREATE_ITEM_ACTIONS.SET_HAS_SCREENSHOT_TAKEN:
      return { ...state, hasScreenshotTaken: action.payload }

    case CREATE_ITEM_ACTIONS.SET_WEARABLE_PREVIEW_UPDATED:
      return { ...state, weareblePreviewUpdated: action.payload }

    case CREATE_ITEM_ACTIONS.SET_ITEM_SORTED_CONTENTS:
      return { ...state, itemSortedContents: action.payload }

    case CREATE_ITEM_ACTIONS.SET_FROM_VIEW:
      return { ...state, fromView: action.payload }

    case CREATE_ITEM_ACTIONS.SET_MODEL:
      return { ...state, model: action.payload }

    case CREATE_ITEM_ACTIONS.SET_VIDEO_PREVIEW:
      return { ...state, video: action.payload }

    case CREATE_ITEM_ACTIONS.SET_ACCEPTED_PROPS:
      return { ...state, ...action.payload }

    case CREATE_ITEM_ACTIONS.UPDATE_THUMBNAIL_BY_CATEGORY:
      return {
        ...state,
        thumbnail: action.payload.thumbnail,
        isLoading: action.payload.isLoading
      }

    case CREATE_ITEM_ACTIONS.CLEAR_ERROR:
      return { ...state, error: undefined }

    case CREATE_ITEM_ACTIONS.RESET_STATE:
      return { ...state, ...action.payload }

    default:
      return state
  }
}
