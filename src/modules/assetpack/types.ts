import { Asset, BaseAsset } from 'modules/asset/types'

export type AssetPack = BaseAssetPack & {
  assets: string[] // asset ids
}

export type RemoteAssetPack = BaseAssetPack & {
  assets: BaseAsset[]
}

export type FullAssetPack = BaseAssetPack & {
  id: string
  assets: Asset[]
}

type BaseAssetPack = {
  version: number
  title: string
}
