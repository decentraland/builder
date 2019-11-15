import { AssetParameterOption } from 'modules/asset/types'

export type Props = {
  id: string
  label?: string
  value: string
  options: AssetParameterOption[]
  className?: string
  onChange(value: string): void
}
