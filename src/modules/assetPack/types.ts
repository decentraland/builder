import { Asset } from 'modules/asset/types'

export type BaseAssetPack = {
  id: string
  title: string
  thumbnail: string
  url: string
  isNew: boolean
  isLoaded: boolean
}

export type FullAssetPack = BaseAssetPack & {
  assets: Asset[]
}

export type AssetPack = BaseAssetPack & {
  assets: string[] // asset ids
}
