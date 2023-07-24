import { BuiltItem, Content } from '@dcl/builder-client'
import { BodyShape, EmoteDataADR74, Wearable, WearableCategory, Rarity as ItemRarity, HideableWearableCategory } from '@dcl/schemas'
import { AnimationMetrics, ModelMetrics } from 'modules/models/types'
import { Cheque } from 'modules/thirdParty/types'

export enum EntityHashingType {
  V0,
  V1
}

export type BuiltFile<T extends Content> = BuiltItem<T> & { fileName: string }

export enum ItemType {
  WEARABLE = 'wearable',
  EMOTE = 'emote'
}

export enum SyncStatus {
  UNPUBLISHED = 'unpublished', // contract not deployed yet
  UNDER_REVIEW = 'under_review', // contract deployed, but not approved yet
  LOADING = 'loading', // contract deployed and approved, but entitiy not loaded yet from catalyst
  UNSYNCED = 'unsynced', // contract deployed and approved, but contents in catalyst (entity) are different from contents on builder (item)
  SYNCED = 'synced' // contract deployed and approved, and contents in catalyst === contents on builder
}

export enum EmotePlayMode {
  SIMPLE = 'simple',
  LOOP = 'loop'
}

export enum ItemMetadataType {
  WEARABLE = 'w',
  SMART_WEARABLE = 'sw',
  EMOTE = 'e'
}

export const BODY_SHAPE_CATEGORY = 'body_shape'

export enum BodyShapeType {
  BOTH = 'both',
  MALE = 'male',
  FEMALE = 'female'
}
export enum WearableBodyShapeType {
  MALE = 'BaseMale',
  FEMALE = 'BaseFemale'
}

export type WearableRepresentation = {
  bodyShapes: BodyShape[]
  mainFile: string
  contents: string[]
  overrideReplaces: HideableWearableCategory[]
  overrideHides: HideableWearableCategory[]
}

export type EmoteRepresentation = {
  bodyShapes: BodyShape[]
  mainFile: string
  contents: string[]
}

export const RARITY_COLOR_LIGHT: Record<ItemRarity, string> = {
  [ItemRarity.UNIQUE]: '#fde97b',
  [ItemRarity.MYTHIC]: '#ffc3f0',
  [ItemRarity.LEGENDARY]: '#d4a2fb',
  [ItemRarity.EPIC]: '#96befb',
  [ItemRarity.RARE]: '#5dfdbe',
  [ItemRarity.UNCOMMON]: '#ffb3a0',
  [ItemRarity.COMMON]: '#f6f7fa'
}

export const RARITY_COLOR: Record<ItemRarity, string> = {
  [ItemRarity.UNIQUE]: '#cd8f1b',
  [ItemRarity.MYTHIC]: '#e347b8',
  [ItemRarity.LEGENDARY]: '#7a2fb3',
  [ItemRarity.EPIC]: '#2062af',
  [ItemRarity.RARE]: '#00a566',
  [ItemRarity.UNCOMMON]: '#f1643b',
  [ItemRarity.COMMON]: '#888d8f'
}

export const RARITY_MAX_SUPPLY: Record<ItemRarity, number> = {
  [ItemRarity.UNIQUE]: 1,
  [ItemRarity.MYTHIC]: 10,
  [ItemRarity.LEGENDARY]: 100,
  [ItemRarity.EPIC]: 1000,
  [ItemRarity.RARE]: 5000,
  [ItemRarity.UNCOMMON]: 10000,
  [ItemRarity.COMMON]: 100000
}

export type WearableData = {
  category?: WearableCategory
  representations: WearableRepresentation[]
  replaces: HideableWearableCategory[]
  hides: HideableWearableCategory[]
  removesDefaultHiding?: HideableWearableCategory[]
  tags: string[]
  requiredPermissions?: string[]
  isSmart?: boolean
}

type BaseItem = {
  id: string // uuid
  name: string
  thumbnail: string
  video?: string
  description: string
  rarity?: ItemRarity
  metrics: ModelMetrics
  createdAt: number
  updatedAt: number
}

export type CatalystItem = Wearable

export type ItemApprovalData = {
  cheque: Cheque
  content_hashes: Record<string, string>
  chequeWasConsumed: boolean
  root: string | null
}

export type Item<T = ItemType.WEARABLE> = Omit<BaseItem, 'metrics'> & {
  type: ItemType
  owner: string
  collectionId?: string
  tokenId?: string
  price?: string
  urn?: string
  beneficiary?: string
  totalSupply?: number
  isPublished: boolean
  isApproved: boolean
  inCatalyst: boolean
  contents: Record<string, string>
  blockchainContentHash: string | null
  currentContentHash: string | null
  catalystContentHash: string | null
  data: T extends ItemType.WEARABLE ? WearableData : EmoteDataADR74
  metrics: T extends ItemType.WEARABLE ? ModelMetrics : AnimationMetrics
}

export const isEmoteItemType = (item: Item | Item<ItemType.EMOTE>): item is Item<ItemType.EMOTE> =>
  (item as Item<ItemType.EMOTE>).type === ItemType.EMOTE

export const isEmoteData = (data: WearableData | EmoteDataADR74): data is EmoteDataADR74 => (data as EmoteDataADR74).loop !== undefined

export enum Currency {
  MANA = 'MANA',
  USD = 'USD'
}

export type Rarity = {
  id: ItemRarity
  name: ItemRarity
  price: string
  maxSupply: string
  prices?: Record<Currency, string>
}

export type ThirdPartyContractItem = [string, string]
export type InitializeItem = [string, string, string, string]

export type GenerateImageOptions = { width?: number; height?: number; thumbnail?: Blob }

export const THUMBNAIL_PATH = 'thumbnail.png'
export const VIDEO_PATH = 'video.mp4'
export const IMAGE_PATH = 'image.png'
export const SCENE_PATH = 'scene.json'
export const SCENE_LOGIC_PATH = 'bin/game.js'
export const ITEM_NAME_MAX_LENGTH = 32
export const ITEM_DESCRIPTION_MAX_LENGTH = 64
export const MODEL_EXTENSIONS = ['.zip', '.gltf', '.glb']
export const IMAGE_EXTENSIONS = ['.zip', '.png']
export const VIDEO_EXTENSIONS = ['.mp4']
export const ITEM_EXTENSIONS = ['.zip', '.gltf', '.glb', '.png']
export const IMAGE_CATEGORIES = [WearableCategory.EYEBROWS, WearableCategory.EYES, WearableCategory.MOUTH]

export { ItemRarity }
