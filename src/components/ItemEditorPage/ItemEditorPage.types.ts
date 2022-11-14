import { Item } from 'modules/item/types'

export type Props = Record<string, unknown>

export type State = {
  reviewedItems: Item[]
}
