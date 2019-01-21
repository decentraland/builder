import { Asset, BaseAsset } from 'modules/asset/types'

export type AssetPack = BaseAssetPack & {
  assets: string[] // asset ids
}

export type RemoteAssetPack = BaseAssetPack & {
  assets: BaseAsset[]
}

export type FullAssetPack = BaseAssetPack & {
  assets: Asset[]
}

type BaseAssetPack = {
  id: string
  version: number
  title: string
}
