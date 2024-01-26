import { Color4 } from 'lib/colors'

export type Props = {
  currentColor: Color4
  colors: Color4[]
  label: string
  onChange: (color: Color4) => void
}
