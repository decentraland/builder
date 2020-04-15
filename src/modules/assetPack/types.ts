import { Asset, RawAsset } from 'modules/asset/types'
import { Omit } from 'decentraland-dapps/dist/lib/types'

export type AssetPack = {
  id: string
  title: string
  thumbnail: string
  ethAddress: string | null
  createdAt?: string
  updatedAt?: string
  assets: string[]
}

export type FullAssetPack = Omit<AssetPack, 'assets'> & {
  assets: Asset[]
}

export type RawAssetPack = Omit<FullAssetPack, 'assets'> & {
  assets: RawAsset[]
}

export type MixedAssetPack = Omit<AssetPack, 'assets'> & {
  assets: Array<RawAsset | Asset>
}

export enum ProgressStage {
  NONE,
  CREATE_ASSET_PACK,
  UPLOAD_CONTENTS
}
