import { BodyShape, WearableCategory } from '@dcl/schemas'
import type { Wearable } from 'decentraland-ecs'

export type Props = {
  wearable: Wearable | null
  category: WearableCategory
  bodyShape: BodyShape
  label: string
  isNullable?: boolean
  onChange: (category: WearableCategory, bodyShape: BodyShape, wearable: Wearable | null) => void
  baseWearables: Wearable[]
}

export type MapStateProps = Pick<Props, 'baseWearables'>
