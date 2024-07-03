import { LinkedContractProtocol } from 'lib/urn'

export type ThirdParty = {
  id: string
  managers: string[]
  name: string
  description: string
  contracts: LinkedContract[]
  maxItems: string
  totalItems: string
  availableSlots?: number
}

export type LinkedContract = {
  address: string
  network: LinkedContractProtocol
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

export enum ThirdPartyVersion {
  V1 = 1,
  V2 = 2
}
