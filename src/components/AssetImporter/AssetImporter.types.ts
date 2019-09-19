import { RawAssetPack } from 'modules/assetPack/types'
import { RawAsset } from 'modules/asset/types'

export type Props = {
  assetPack?: RawAssetPack
  onSubmit(assetPack: RawAssetPack): void
}

export type State = {
  assetPackId: string
  files: Record<string, ImportedFile>
}

export type ImportedFile = {
  id: string
  fileName: string
  asset: RawAsset
  error?: string
}
