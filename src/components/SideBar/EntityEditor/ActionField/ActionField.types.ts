import { AssetActionValue, Asset } from 'modules/asset/types'

export type Props = {
  label: string
  value: AssetActionValue
  entityAssets: Record<string, Asset>
  className?: string
  onChange(value: AssetActionValue): void
}

export type State = {
  value: AssetActionValue
}

export type MapStateProps = Pick<Props, 'entityAssets'>
