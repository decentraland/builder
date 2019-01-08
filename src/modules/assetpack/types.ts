export type AssetPack = {
  version: number
  title: string
  assets: AssetDescriptor[]
}

export type AssetResource = {
  name: string
  url: string
  thumbnail: string
}

export type AssetDescriptor = AssetResource & {
  id: string
  tags: string[]
  category: string
  variations: AssetResource[]
}
