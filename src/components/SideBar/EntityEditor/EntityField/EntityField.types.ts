import { Scene } from 'modules/scene/types'
import { Asset } from 'modules/asset/types'

export type Props = {
  id: string
  label?: string
  value: string
  entities: Scene['entities']
  assetsByEntityName: Record<string, Asset>
  filter?: string[]
  className?: string
  onChange(value: string): void
}

export type MapStateProps = Pick<Props, 'entities' | 'assetsByEntityName'>

export type State = {
  value: string
}
