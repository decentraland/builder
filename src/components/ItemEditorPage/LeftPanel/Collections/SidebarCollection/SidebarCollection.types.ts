import { Collection } from 'modules/collection/types'
import { setCollection } from 'modules/item/actions'
import { Item } from 'modules/item/types'

export type Props = {
  collection: Collection
  items: Item[]
  isSelected: boolean
  onSetCollection: typeof setCollection
}
