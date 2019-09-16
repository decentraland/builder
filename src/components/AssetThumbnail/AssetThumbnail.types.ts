import { Asset, RawAsset } from 'modules/asset/types'

export type Props = {
  error?: string
  asset: RawAsset | Asset
  onRemove: (id: string) => void
}
