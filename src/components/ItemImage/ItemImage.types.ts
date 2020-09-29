import { Item } from 'modules/item/types'
import { Props as BadgeProps } from 'components/ItemBadge/ItemBadge.types'

export type Props = {
  item: Item
  hasBadge?: boolean
  badgeSize?: BadgeProps['size']
}
