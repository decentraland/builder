import { Item } from 'modules/item/types'
import { Mint } from 'modules/collection/types'

export type Props = {
  item: Item
  mints: Partial<Mint>[]
  onChange: (item: Item, mints: Partial<Mint>[]) => void
}
