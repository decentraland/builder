import { RawAsset } from 'modules/asset/types'

export type Props = {
  asset: RawAsset
  error?: string
  errorLabel?: string
  hideLabel?: boolean
  onRemove: (id: string) => void
  onClick?: (asset: RawAsset) => void
}
