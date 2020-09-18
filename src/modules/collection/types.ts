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
  minters: string[]
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

export type MinterAccess = {
  address: string
  hasAccess: boolean
  collection: Collection
}
