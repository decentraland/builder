import { WearableBodyShape, WearableCategory } from '@dcl/schemas'
import { Wearable } from 'decentraland-ecs'

export type Props = {
  wearable: Wearable | null
  category: WearableCategory
  bodyShape: WearableBodyShape
  label: string
  isNullable?: boolean
  onChange: (category: WearableCategory, bodyShape: WearableBodyShape, wearable: Wearable | null) => void
  baseWearables: Wearable[]
}

export type MapStateProps = Pick<Props, 'baseWearables'>
