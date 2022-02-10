import { Item, WearableBodyShape } from 'modules/item/types'

export type Props = {
  item: Item
  isVisible: boolean
  isSelected: boolean
  selectedCollectionId: string | null
  bodyShape: WearableBodyShape
  onClick: (item: Item) => void
}
