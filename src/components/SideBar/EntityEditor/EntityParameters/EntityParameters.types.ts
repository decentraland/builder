import { AssetParameter, AssetParameterValues } from 'modules/asset/types'

export type Props = {
  id: string
  parameters: AssetParameter[]
  entityName: string
  values: AssetParameterValues
  entityNames: string[]
  className?: string
  onChange(values: AssetParameterValues): void
}

export type State = {
  values: AssetParameterValues
}

export type MapStateProps = Pick<Props, 'entityNames'>
