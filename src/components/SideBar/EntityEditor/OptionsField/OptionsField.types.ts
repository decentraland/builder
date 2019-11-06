import { AssetParameterOption } from 'modules/asset/types'

export type Props = {
  label: string
  value: string
  options: AssetParameterOption[]
  className?: string
  onChange(value: string): void
}

export type State = {
  value: string
}
