import { RawAssetPack } from 'modules/assetPack/types'

export enum CreateAssetPackStep {
  IMPORT,
  EDIT_ASSETS,
  EDIT_ASSET_PACK
}

export type State = {
  view: CreateAssetPackStep
  assetPack: RawAssetPack | null
}
