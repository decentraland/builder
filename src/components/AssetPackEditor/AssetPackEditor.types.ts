import { RawAssetPack } from 'modules/assetPack/types'

export type Props<T extends RawAssetPack> = {
  assetPack: T
  onChange: (assetPack: RawAssetPack) => void
  onSubmit: (assetPack: RawAssetPack) => void
  onReset: () => void
}

export type State = {
  errors: Record<string, string>
  isDirty: boolean
}
