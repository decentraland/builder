import { AssetActionValue, Asset } from 'modules/asset/types'

export type Props = {
  id: string
  label: string
  value: AssetActionValue[]
  entityAssets: Record<string, Asset>
  className?: string
  onChange(value: AssetActionValue[]): void
}

export type MapStateProps = Pick<Props, 'entityAssets'>
