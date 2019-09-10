import { RawAssetPack } from 'modules/assetPack/types'

export enum CreateAssetPackStep {
  IMPORT,
  EDIT_ASSETS
}

export type State = {
  view: CreateAssetPackStep
  assetPack: RawAssetPack | null
}
