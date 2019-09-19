import { RawAssetPack } from 'modules/assetPack/types'

export type Props = {
  assetPack: RawAssetPack
  isEditing?: boolean
  onChange: (assetPack: RawAssetPack) => void
  onSubmit: (assetPack: RawAssetPack) => void
}

export type State = {
  currentAsset: number
  errors: Record<string, Record<string, string>>
  isDirty: boolean
}
