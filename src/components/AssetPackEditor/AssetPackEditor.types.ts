import { RawAssetPack } from 'modules/assetPack/types'
import { RawAsset } from 'modules/asset/types'

export type Props<T extends RawAssetPack> = {
  assetPack: T
  onChange: (assetPack: RawAssetPack) => void
  onSubmit: (assetPack: RawAssetPack) => void
  onReset: () => void
  onAddAssets?: () => void
  onEditAsset?: (asset: RawAsset) => void
  onDeleteAssetPack?: () => void
  error: string | null
}

export type State = {
  errors: Record<string, string>
  isDirty: boolean
}
