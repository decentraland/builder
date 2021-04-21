import { Color4 } from 'decentraland-ecs'

export type Props = {
  currentColor: Color4
  colors: Color4[]
  label: string
  onChange: (color: Color4) => void
}
