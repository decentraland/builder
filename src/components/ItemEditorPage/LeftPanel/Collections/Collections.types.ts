import { Collection } from 'modules/collection/types'
import { setCollection } from 'modules/item/actions'
import { Item } from 'modules/item/types'

export type Props = {
  selectedCollectionId: string | null
  collections: Collection[]
  items: Item[]
  hasHeader: boolean
  onSetCollection: typeof setCollection
}
