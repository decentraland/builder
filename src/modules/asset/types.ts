export const GROUND_CATEGORY = 'ground'

export type Asset = BaseAsset & {
  assetPackId: string
}

export type BaseAsset = AssetResource & {
  id: string
  tags: string[]
  category: string // name of the category
  variations: AssetResource[]
  contents: Record<string, string>
  main?: boolean
}

export type AssetResource = {
  name: string
  url: string
  thumbnail: string
}

export type AssetMappings = Record<string, string>
