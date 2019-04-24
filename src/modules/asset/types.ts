export const GROUND_CATEGORY = 'ground'

export const COLLECTIBLE_CATEGORY = 'collectibles'

export type Asset = BaseAsset & {
  assetPackId: string | null // collectibles and custom gltfs wouldn't have asset
}

export type BaseAsset = AssetResource & {
  id: string
  tags: string[]
  category: string // name of the category
  variations: AssetResource[]
  contents: Record<string, string>
}

export type AssetResource = {
  name: string
  url: string
  thumbnail: string
}

export type AssetMappings = Record<string, string>

export type RemoteCollectibleAssetResponse = {
  asset_type_ownerships: []
  assets: RemoteCollectibleAsset[]
}

export type RemoteCollectibleAsset = {
  token_id: string
  background_color: string
  image_thumbnail_url: string
  name: string
  description: string
  external_link: string
  /* Excerpt of the entire OpenSea API */
}
