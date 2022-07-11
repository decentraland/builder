import { BodyShape } from '@dcl/schemas'
import { Item } from 'modules/item/types'

export type Props = {
  item: Item
  isVisible: boolean
  isSelected: boolean
  selectedCollectionId: string | null
  bodyShape: BodyShape
  onClick: (item: Item) => void
}
