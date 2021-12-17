import { setItems } from 'modules/editor/actions'
import { Item, WearableBodyShape } from 'modules/item/types'
import { toggleThirdPartyItem } from 'modules/ui/itemEditor/actions'

export type Props = {
  selectedItemId: string | null
  selectedCollectionId: string | null
  selectedThirdPartyItemIds: string[]
  visibleItems: Item[]
  items: Item[]
  hasHeader: boolean
  bodyShape: WearableBodyShape
  onSetItems: typeof setItems
  onToggleThirdPartyItem: typeof toggleThirdPartyItem
}
