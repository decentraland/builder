import { FullAssetPack } from 'modules/assetPack/types'
import { Asset } from 'modules/asset/types'

export type Props = {
  onAssetPack(assetPack: FullAssetPack): void
}

export type State = {
  assetPackId: string
  files: Record<string, ImportedFile>
  canImport: boolean
}

export type RawAsset = Partial<Pick<Asset, 'tags' | 'category'>> & {
  id: string
  name: string
  url: string
  assetPackId: string
  thumbnail?: string
  contents: Record<string, Blob>
}

export type ImportedFile = {
  id: string
  fileName: string
  asset: RawAsset
  isCorrupted?: boolean
}
