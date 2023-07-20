import { SceneSDK6 } from 'modules/scene/types'
import { Asset } from 'modules/asset/types'

export type Props = {
  id: string
  label?: string
  value: string
  entities: SceneSDK6['entities']
  assetsByEntityName: Record<string, Asset>
  direction?: 'left' | 'right' | null
  filter?: string[]
  className?: string
  onChange(value: string): void
}

export type MapStateProps = Pick<Props, 'entities' | 'assetsByEntityName'>

export type State = {
  value: string
  search: string
}
