import { RawAssetPack } from 'modules/assetPack/types'
import { RawAsset } from 'modules/asset/types'

export type Props = {
  assetPack: RawAssetPack
  error: string | null
  remoteAssets?: string[] // Array of IDs of assets that already existed server side
  onChange: (assetPack: RawAssetPack) => void
  onSubmit: (assetPack: RawAssetPack) => void
  onReset: () => void
  onAddAssets?: () => void
  onEditAsset?: (asset: RawAsset) => void
  onDeleteAssetPack?: () => void
}

export type State = {
  errors: Record<string, string>
  isDirty: boolean
}
