import { RawAssetPack } from 'modules/assetPack/types'

export type Props<T extends RawAssetPack> = {
  assetPack: T
  onChange: (assetPack: T) => void
}

export type State = {}
