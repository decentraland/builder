export type Asset = BaseAsset & {
  id: string
  assetPackId: string
}

export type BaseAsset = AssetResource & {
  tags: string[]
  category: string
  variations: AssetResource[]
}

export type AssetResource = {
  name: string
  url: string
  thumbnail: string
}
