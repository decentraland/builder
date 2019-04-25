import { BaseAssetPack } from './types'

export function getDefualtSelection(assetPacks: BaseAssetPack[]) {
  return assetPacks.map(assetPack => assetPack.id)
}
