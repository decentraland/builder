import { EmoteCategory, WearableCategory, Rarity } from '@dcl/schemas'

export type Props = {
  rarity: Rarity
  category: WearableCategory | EmoteCategory
  size: 'medium' | 'small'
  withTooltip: boolean
  className?: string
}

export type OwnProps = Pick<Props, 'rarity' | 'category'>
