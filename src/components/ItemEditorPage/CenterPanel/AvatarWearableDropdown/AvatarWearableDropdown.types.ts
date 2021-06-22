import { Wearable } from 'decentraland-ecs'
import { WearableBodyShape, WearableCategory } from 'modules/item/types'

export type Props = {
  wearable: Wearable | null
  category: WearableCategory
  bodyShape: WearableBodyShape
  label: string
  isNullable?: boolean
  onChange: (category: WearableCategory, bodyShape: WearableBodyShape, wearable: Wearable | null) => void
}
