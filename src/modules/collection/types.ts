import { Item } from 'modules/item/types'

export type Collection = {
  id: string // uuid
  name: string
  owner: string
  contractAddress?: string
  salt?: string
  isPublished: boolean
  isApproved: boolean
  minters: string[]
  managers: string[]
  forumLink?: string
  reviewedAt: number
  createdAt: number
  updatedAt: number
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
