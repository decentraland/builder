import { RawAsset, Asset } from 'modules/asset/types'

export type Props<T> = {
  assetPack: T
  error: string | null
  remoteAssets?: string[] // Array of IDs of assets that already existed server side
  onChange: (assetPack: T) => void
  onSubmit: (assetPack: T) => void
  onReset: () => void
  onAddAssets?: () => void
  onEditAsset?: (asset: RawAsset | Asset) => void
  onDeleteAssetPack?: (assetPack: T) => any
}

export type State = {
  errors: Record<string, string>
  isDirty: boolean
  isLoading: boolean
}
