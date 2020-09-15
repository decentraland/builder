import { Item } from 'modules/item/types'

export type Props = {
  item: Item
}

export type State = {
  beneficiaries: Beneficiary[]
}

export type Beneficiary = {
  address?: string
  amount?: number
}
