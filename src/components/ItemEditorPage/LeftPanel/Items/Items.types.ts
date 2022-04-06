import { setItems } from 'modules/editor/actions'
import { Item, WearableBodyShape } from 'modules/item/types'

export type Props = {
  selectedItemId: string | null
  selectedCollectionId: string | null
  visibleItems: Item[]
  items: Item[]
  hasHeader: boolean
  bodyShape: WearableBodyShape
  onSetItems: typeof setItems
}
