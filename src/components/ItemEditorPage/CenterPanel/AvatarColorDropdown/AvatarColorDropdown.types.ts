import { Color4 } from 'decentraland-ecs'

export type Props = {
  currentTone: Color4
  tones: Color4[]
  label: string
  onChange: (color: Color4) => void
}
