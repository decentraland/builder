import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'

export type Props = {
  collection: Collection
  items: Item[]
  isSelected: boolean
}
