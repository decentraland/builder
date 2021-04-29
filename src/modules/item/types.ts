import { ModelMetrics } from 'modules/scene/types'

export enum ItemType {
  WEARABLE = 'wearable'
}

export enum ItemRarity {
  UNIQUE = 'unique',
  MYTHIC = 'mythic',
  LEGENDARY = 'legendary',
  EPIC = 'epic',
  RARE = 'rare',
  UNCOMMON = 'uncommon',
  COMMON = 'common'
}

export enum WearableCategory {
  EARRING = 'earring',
  EYEWEAR = 'eyewear',
  EYEBROWS = 'eyebrows',
  EYES = 'eyes',
  FACIAL_HAIR = 'facial_hair',
  FEET = 'feet',
  HAIR = 'hair',
  HAT = 'hat',
  HELMET = 'helmet',
  LOWER_BODY = 'lower_body',
  MASK = 'mask',
  MOUTH = 'mouth',
  UPPER_BODY = 'upper_body',
  TIARA = 'tiara',
  TOP_HEAD = 'top_head'
}

export const BODY_SHAPE_CATEGORY = 'body_shape'

export enum BodyShapeType {
  BOTH = 'both',
  MALE = 'male',
  FEMALE = 'female'
}

export enum WearableBodyShape {
  MALE = 'urn:decentraland:off-chain:base-avatars:BaseMale',
  FEMALE = 'urn:decentraland:off-chain:base-avatars:BaseFemale'
}

export type WearableRepresentation = {
  bodyShapes: WearableBodyShape[]
  mainFile: string
  contents: string[]
  overrideReplaces: WearableCategory[]
  overrideHides: WearableCategory[]
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
  replaces: WearableCategory[]
  hides: WearableCategory[]
  tags: string[]
}

type BaseItem = {
  id: string // uuid
  name: string
  thumbnail: string
  description: string
  rarity?: ItemRarity
  metrics: ModelMetrics
  contents: Record<string, string>
  createdAt: number
  updatedAt: number
}

export type CatalystItem = BaseItem & {
  i18n: { code: string; text: string }[]
  data: WearableData
  image: string
  collectionAddress: string
}

export type Item = BaseItem & {
  type: ItemType
  owner: string
  collectionId?: string
  tokenId?: string
  price?: string
  beneficiary?: string
  totalSupply?: number
  isPublished: boolean
  isApproved: boolean
  inCatalyst: boolean
  data: WearableData
}

export type Rarity = {
  id: ItemRarity
  name: ItemRarity
  price: string
  maxSupply: string
}

export const THUMBNAIL_PATH = 'thumbnail.png'
export const IMAGE_PATH = 'image.png'
export const ITEM_NAME_MAX_LENGTH = 32
export const ITEM_DESCRIPTION_MAX_LENGTH = 64
