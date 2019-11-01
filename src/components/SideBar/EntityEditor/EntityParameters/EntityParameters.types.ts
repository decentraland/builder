import { AssetParameter, AssetParameterValues } from 'modules/asset/types'

export type Props = {
  parameters: AssetParameter[]
  values: AssetParameterValues
  onChange(values: AssetParameterValues): void
}

export type State = {
  values: AssetParameterValues
}
