import { BaseAssetPack } from './types'

export function getDefaultSelection(assetPacks: BaseAssetPack[]) {
  return assetPacks.map(assetPack => assetPack.id)
}
