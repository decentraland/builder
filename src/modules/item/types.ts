import { ModelMetrics } from 'modules/scene/types'
import { Collection } from 'modules/collection/types'

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
  EYEBROWS = 'eyebrows',
  EYES = 'eyes',
  FACIAL_HAIR = 'facial_hair',
  HAIR = 'hair',
  MOUTH = 'mouth',
  UPPER_BODY = 'upper_body',
  LOWER_BODY = 'lower_body',
  FEET = 'feet',
  EARRING = 'earring',
  EYEWEAR = 'eyewear',
  HAT = 'hat',
  HELMET = 'helmet',
  MASK = 'mask',
  TIARA = 'tiara',
  TOP_HEAD = 'top_head'
}

export const BODY_SHAPE_CATEGORY = 'body_shape'

export enum BodyShapeType {
  UNISEX = 'unisex',
  MALE = 'male',
  FEMALE = 'female'
}

export enum WearableBodyShape {
  MALE = 'dcl://base-avatars/BaseMale',
  FEMALE = 'dcl://base-avatars/BaseFemale'
}

export type WearableRepresentation = {
  bodyShape: WearableBodyShape[]
  mainFile: string
  contents: string[]
  overrideReplaces: WearableCategory[]
  overrideHides: WearableCategory[]
}

export const RARITY_COLOR_LIGHT: Record<ItemRarity, string> = {
  [ItemRarity.UNIQUE]: '#FFE617',
  [ItemRarity.MYTHIC]: '#FB7DE3',
  [ItemRarity.LEGENDARY]: '#A657ED',
  [ItemRarity.EPIC]: '#6397F2',
  [ItemRarity.RARE]: '#3AD682',
  [ItemRarity.UNCOMMON]: '#FF8563',
  [ItemRarity.COMMON]: '#D4E0E0'
}

export const RARITY_COLOR: Record<ItemRarity, string> = {
  [ItemRarity.UNIQUE]: '#FFB626',
  [ItemRarity.MYTHIC]: '#FF63E1',
  [ItemRarity.LEGENDARY]: '#842DDA',
  [ItemRarity.EPIC]: '#3D85E6',
  [ItemRarity.RARE]: '#36CF75',
  [ItemRarity.UNCOMMON]: '#ED6D4F',
  [ItemRarity.COMMON]: '#ABC1C1'
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

export type Item = {
  id: string // uuid
  name: string
  thumbnail: string
  owner: string
  description?: string
  collectionId?: string
  tokenId?: string
  price?: number
  beneficiary?: string
  rarity?: ItemRarity
  totalSupply?: number
  isPublished: boolean
  isApproved: boolean
  inCatalyst: boolean
  type: ItemType
  data: WearableData
  contents: Record<string, string>
  metrics: ModelMetrics
  createdAt: number
  updatedAt: number
}

export type CollectionItem = Item & {
  collection?: Collection
}

export const THUMBNAIL_PATH = 'thumbnail.png'
