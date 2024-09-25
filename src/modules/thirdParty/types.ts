import { ContractNetwork } from '@dcl/schemas'

export type ThirdParty = {
  id: string
  root: string
  managers: string[]
  name: string
  description: string
  isApproved: boolean
  contracts: LinkedContract[]
  maxItems: string
  totalItems: string
  availableSlots?: number
  published: boolean
  isProgrammatic: boolean
}

export type LinkedContract = {
  address: string
  network: ContractNetwork
}

export type Cheque = {
  signature: string
  qty: number
  salt: string
}

export type Slot = {
  qty: number
  salt: string
  sigR: string
  sigS: string
  sigV: number
}

export type ThirdPartyPrice = {
  item: { usd: string; mana: string }
  programmatic: { usd: string; mana: string }
}
