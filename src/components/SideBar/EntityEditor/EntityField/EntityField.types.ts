import { Scene } from 'modules/scene/types'

export type Props = {
  label: string
  value: string
  entities: Scene['entities']
  filter?: string[]
  className?: string
  onChange(value: string): void
}

export type MapStateProps = Pick<Props, 'entities'>

export type State = {
  value: string
}
