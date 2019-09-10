import { RawAssetPack } from 'modules/assetPack/types'

export type Props = {
  assetPack: RawAssetPack
  onChange: (assetPack: RawAssetPack) => void
  onSubmit: (assetPack: RawAssetPack) => void
}

export type State = {
  currentAsset: number
  errors: Record<string, Record<string, string>>
}
