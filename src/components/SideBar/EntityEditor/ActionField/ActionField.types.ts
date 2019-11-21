import { AssetActionValue, Asset, AssetParameter } from 'modules/asset/types'

export type Props = {
  id: string
  label: string
  value: AssetActionValue[]
  entityAssets: Record<string, Asset>
  parameter: AssetParameter
  entityName: string
  className?: string
  onChange(value: AssetActionValue[]): void
}

export type MapStateProps = Pick<Props, 'entityAssets'>
