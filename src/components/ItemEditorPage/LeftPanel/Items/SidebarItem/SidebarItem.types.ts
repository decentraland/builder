import { Item, WearableBodyShape } from 'modules/item/types'

export type Props = {
  item: Item
  isVisible: boolean
  isSelected: boolean
  isChecked: boolean
  selectedCollectionId: string | null
  bodyShape: WearableBodyShape
  onClick: (item: Item) => void
  onToggle: (item: Item, isSelected: boolean) => void
}
