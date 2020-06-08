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
  name: string | null
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

export type OpenSeaResponse = {
  assets: OpenSeaAsset[]
}

export type OpenSeaAsset = {
  token_id: string
  num_sales: number
  background_color: string | null
  image_url: string | null
  image_preview_url: string | null
  image_thumbnail_url: string | null
  image_original_url: string | null
  animation_url: string | null
  animation_original_url: string | null
  name: string | null
  description: string | null
  external_link: string | null
  asset_contract: {
    address: string
    asset_contract_type: 'non-fungible' | 'fungible'
    created_date: string
    name: string
    nft_version: string | null
    opensea_version: string | null
    owner: number
    schema_name: 'ERC721'
    symbol: string
    total_supply: string
    description: string | null
    external_link: string | null
    image_url: string | null
    default_to_fiat: boolean
    dev_buyer_fee_basis_points: number
    dev_seller_fee_basis_points: number
    only_proxied_transfers: boolean
    opensea_buyer_fee_basis_points: number
    opensea_seller_fee_basis_points: number
    buyer_fee_basis_points: number
    seller_fee_basis_points: number
    payout_address: string | null
  }
  owner: {
    user?: {
      username: string | null
    }
    profile_img_url: string | null
    address: string
    config: string | null
    discord_id: string | null
  }
  permalink: string
  decimals: number
  auctions: null
  sell_orders: any[]
  traits: any[]
  last_sale: string | null
  top_bid: string | null
  listing_date: string | null
  is_presale: boolean
  transfer_fee_payment_token: string | null
  transfer_fee: string | null
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
