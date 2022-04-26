import { WearableBodyShape } from '@dcl/schemas'
import { Item } from 'modules/item/types'

export type Props = {
  item: Item
  isVisible: boolean
  isSelected: boolean
  selectedCollectionId: string | null
  bodyShape: WearableBodyShape
  onClick: (item: Item) => void
}
