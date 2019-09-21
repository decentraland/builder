import { RawAsset, Asset } from 'modules/asset/types'

export type Props = {
  asset: RawAsset | Asset
  error?: string
  errorLabel?: string
  hideLabel?: boolean
  onRemove: (id: string) => void
  onClick?: (asset: RawAsset | Asset) => void
}
