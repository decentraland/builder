import { Scene } from 'modules/scene/types'

export type Props = {
  id: string
  label: string
  value: string
  entities: Scene['entities']
  className?: string
  onChange(id: string, value: string): void
}

export type MapStateProps = Pick<Props, 'entities'>

export type State = {
  value: string
}
