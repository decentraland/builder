import { RawAssetPack } from 'modules/assetPack/types'

export type Props = {
  assetPack: RawAssetPack
  startingAsset?: string
  ignoredAssets?: string[] // Ignored Asset IDs
  onChange: (assetPack: RawAssetPack) => void
  onSubmit: (assetPack: RawAssetPack) => void
}

export type State = {
  currentAsset: number
  errors: Record<string, Record<string, string>>
  isDirty: boolean
}
