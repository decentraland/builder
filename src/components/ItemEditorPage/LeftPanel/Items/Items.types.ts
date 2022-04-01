import { setItems } from 'modules/editor/actions'
import { Item, WearableBodyShape } from 'modules/item/types'

export type Props = {
  items: Item[]
  itemsTotal: number | null
  selectedItemId: string | null
  selectedCollectionId: string | null
  visibleItems: Item[]
  hasHeader: boolean
  bodyShape: WearableBodyShape
  onSetItems: typeof setItems
  onLoadNextPage: () => void
}
