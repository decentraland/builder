import { RawAssetPack } from 'modules/assetPack/types'
import { RawAsset } from 'modules/asset/types'

export type Props = {
  onAssetPack(assetPack: RawAssetPack): void
}

export type State = {
  assetPackId: string
  files: Record<string, ImportedFile>
  canImport: boolean
}

export type ImportedFile = {
  id: string
  fileName: string
  asset: RawAsset
  isCorrupted?: boolean
}
