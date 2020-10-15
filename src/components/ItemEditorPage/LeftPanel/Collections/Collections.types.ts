import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'

export type Props = {
  selectedCollectionId: string | null
  collections: Collection[]
  items: Item[]
  hasHeader: boolean
}
