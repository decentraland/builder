import { Collection } from 'modules/collection/types'
import { setCollection } from 'modules/item/actions'
import { Item } from 'modules/item/types'

export type State = {
  collections: Collection[]
  resolveNextPagePromise: (() => void) | null
}

export type Props = {
  selectedCollectionId: string | null
  collections: Collection[]
  isLoading: boolean
  totalCollections: number
  items: Item[]
  hasHeader: boolean
  onSetCollection: typeof setCollection
  onLoadNextPage: () => void
}
