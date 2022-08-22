import { BodyShape } from '@dcl/schemas'
import { Item } from 'modules/item/types'

export type Props = {
  item: Item
  size?: 'normal' | 'small'
  bodyShape?: BodyShape
  className?: string
}
