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
