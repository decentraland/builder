import { Asset, RawAsset } from 'modules/asset/types'

export type BaseAssetPack = {
  id: string
  title: string
  thumbnail: string
  url: string
  isLoaded: boolean
  userId?: string
  createdAt?: string
  updatedAt?: string
}

export type FullAssetPack = BaseAssetPack & {
  assets: Asset[]
}

export type AssetPack = BaseAssetPack & {
  assets: string[] // asset ids
}

export type RawAssetPack = Exclude<BaseAssetPack, 'userId'> & {
  assets: RawAsset[]
}
