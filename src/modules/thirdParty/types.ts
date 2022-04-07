export type ThirdParty = {
  id: string
  managers: string[]
  name: string
  description: string
  maxItems: string
  totalItems: string
  availableSlots?: number
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
