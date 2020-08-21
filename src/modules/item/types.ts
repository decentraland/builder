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
