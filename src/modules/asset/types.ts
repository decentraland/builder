import { SceneMetrics } from 'modules/scene/types'

export const GROUND_CATEGORY = 'ground'

export type Asset = BaseAsset & {
  assetPackId: string
  isDisabled?: boolean
}

export type AssetAction = {
  id: string
  label: string
  parameters: AssetParameter[]
  description?: string
}

export type AssetParameter = {
  id: string
  type: AssetParameterType
  label: string
  description?: string
  default?: Exclude<AssetParameterValue, AssetActionValue>
  options?: string[]
}

export type AssetParameterValue = string | number | boolean | AssetActionValue

export type AssetParameterValues = Record<string, AssetParameterValue>

export type AssetActionValue = {
  entityName: string
  actionId: string
  values: AssetParameterValues
}

export enum AssetParameterType {
  BOOLEAN = 'boolean',
  STRING = 'string',
  FLOAT = 'float',
  INTEGER = 'integer',
  ENTITY = 'entity',
  ACTION = 'action'
}

export type BaseAsset = {
  id: string
  name: string
  model: string
  script: string | null
  thumbnail: string
  tags: string[]
  category: string // name of the category
  contents: Record<string, string>
  metrics: SceneMetrics
  parameters: AssetParameter[]
  actions: AssetAction[]
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
  model: string
  script: null | string
  tags: string[]
  category: string
  assetPackId: string
  thumbnail: string
  contents: Record<string, Blob>
  metrics: SceneMetrics
  parameters: AssetParameter[]
  actions: AssetAction[]
}

/**
 * A Record that maps `assetId` to a Record of `{ [cid: string]: Blob }`
 */
export type RawAssetContents = Record<string, Record<string, Blob>>
