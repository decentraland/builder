import { RawAsset } from 'modules/asset/types'

export type Props<T> = {
  assetPack: T
  onSubmit(assetPack: T): void
}

export type State = {
  assetPackId: string
  files: Record<string, ImportedFile>
  isLoading: boolean
}

export type ImportedFile = {
  id: string
  fileName: string
  asset: RawAsset
  error?: string
}
