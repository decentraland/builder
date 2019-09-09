import { RawAssetPack } from 'modules/assetPack/types'

export enum CreateAssetPackStep {
  IMPORT
}

export type State = {
  view: CreateAssetPackStep
  assetPack: RawAssetPack | null
}
