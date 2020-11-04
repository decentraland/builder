import BN from 'bn.js'
import { Address } from 'web3x-es/address'
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
  createdAt: number
  updatedAt: number
}

export type InitializeItem = {
  rarity: number
  totalSupply: number
  price: BN
  beneficiary: Address
  metadata: string
  contentHash: string
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
