import { Item } from 'modules/item/types'

export type Collection = {
  id: string
  name: string
  owner: string
  contractAddress?: string
  urn: string
  salt?: string
  isPublished: boolean
  isApproved: boolean
  itemCount?: number
  minters: string[]
  managers: string[]
  forumLink?: string
  lock?: number
  reviewedAt?: number
  createdAt: number
  updatedAt: number
}

export enum CollectionType {
  DECENTRALAND = 'decentraland',
  THIRD_PARTY = 'third_party'
}

export enum RoleType {
  MANAGER = 'manager',
  MINTER = 'minter'
}

export type Mint = {
  address: string
  amount: number
  item: Item
}

export type Access = {
  address: string
  hasAccess: boolean
  collection: Collection
}

export const COLLECTION_NAME_MAX_LENGTH = 32
export const TP_COLLECTION_NAME_MAX_LENGTH = 64
