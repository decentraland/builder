import { ModelMetrics } from 'modules/models/types'

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
  options?: AssetParameterOption[]
  min?: number
  max?: number
  step?: number
}

export type AssetParameterOption = {
  label: string
  value: string
}

export type AssetParameterValue = string | number | boolean | AssetActionValue[]

export type AssetParameterValues = Record<string, AssetParameterValue>

export type AssetActionValue = {
  entityName: string
  actionId: string
  values: AssetParameterValues
}

export enum AssetParameterType {
  BOOLEAN = 'boolean',
  TEXT = 'text',
  TEXTAREA = 'textarea',
  FLOAT = 'float',
  INTEGER = 'integer',
  ENTITY = 'entity',
  ACTIONS = 'actions',
  OPTIONS = 'options',
  SLIDER = 'slider'
}

export type BaseAsset = {
  id: string
  legacyId?: string | null
  name: string
  model: string
  script: string | null
  thumbnail: string
  tags: string[]
  category: string // name of the category
  contents: Record<string, string>
  metrics: ModelMetrics
  parameters: AssetParameter[]
  actions: AssetAction[]
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
  metrics: ModelMetrics
  parameters: AssetParameter[]
  actions: AssetAction[]
}

/**
 * A Record that maps `assetId` to a Record of `{ [cid: string]: Blob }` with each cid being a hash
 */
export type RawAssetContents = Record<string, Record<string, Blob>>
