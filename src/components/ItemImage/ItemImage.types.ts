import { Item } from 'modules/item/types'
import { Props as BadgeProps } from 'components/ItemBadge/ItemBadge.types'

export type Props = {
  className?: string
  item: Item
  src?: string
  hasBadge?: boolean
  hasRarityBadge?: boolean
  badgeSize?: BadgeProps['size']
  hasRarityBackground?: boolean
}
