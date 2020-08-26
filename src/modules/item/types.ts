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

export enum WearableRepresentation {
  MALE = 'male',
  FEMALE = 'female',
  UNISEX = 'unisex'
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
  type: ItemType
  data: WearableData
  contents: Record<string, string>
}

export type WearableData = {
  category?: WearableCategory
  representation?: WearableRepresentation
  replaces: WearableCategory[]
  hides: WearableCategory[]
  tags: string[]
}
