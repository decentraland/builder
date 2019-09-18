import { Asset, RawAsset } from 'modules/asset/types'

export type Props = {
  error?: string
  hideLabel?: boolean
  asset: RawAsset | Asset
  onRemove: (id: string) => void
}
