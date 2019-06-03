import { Asset } from 'modules/asset/types'
import { COLLECTIBLE_ASSET_PACK_ID, CategoryName } from 'modules/ui/sidebar/utils'

export function getMappings(asset: Asset) {
  const mappings: Record<string, string> = {}
  for (const path of Object.keys(asset.contents)) {
    // skip the thumbnail
    if (!path.includes('thumbnail')) {
      mappings[`${asset.assetPackId}/${path}`] = asset.contents[path]
    }
  }
  return mappings
}

export function isNFT(asset: Asset) {
  return asset.assetPackId === COLLECTIBLE_ASSET_PACK_ID
}

export function isGround(asset: Asset) {
  return asset.category === CategoryName.GROUND_CATEGORY
}
