import { SceneMetrics } from 'modules/scene/types'

export const GROUND_CATEGORY = 'ground'

export type Asset = BaseAsset & {
  assetPackId: string
  isDisabled?: boolean
}

export type BaseAsset = AssetResource & {
  id: string
  tags: string[]
  category: string // name of the category
  contents: Record<string, string>
}

export type AssetResource = {
  name: string
  url: string
  thumbnail: string
}

export type AssetRegistryResponse = {
  registries: AssetRegistry[]
}

export type AssetRegistry = {
  common_name: string
  name: string
  contract_uri: string
  description: string
  schema_url: string
  image_url: string
}

export type DARAssetsResponse = {
  assets: DARAsset[]
}

export type DARAsset = {
  name: string
  owner: string
  description: string
  image: string
  registry: string
  token_id: string
  uri: string
  files: DARAssetFile[]
  traits: any[]
}

export type DARAssetFile = {
  name: string
  url: string
  role: string
}

export type DARAssetTrait = {
  id: string
  name: string
  type: string
}

export type RawAsset = {
  id: string
  name: string
  url: string
  tags: string[]
  category: string // name of the category
  assetPackId: string
  thumbnail: string
  contents: Record<string, Blob>
  metadata: {
    metrics: SceneMetrics
  }
}

export type RawAssetContents = Record<string, RawAsset['contents']>
