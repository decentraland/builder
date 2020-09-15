import { Item } from 'modules/item/types'

export type Props = {
  item: Item
}

export type State = {
  holders: Holder[]
}

export type Holder = {
  address?: string
  amount?: number
}
