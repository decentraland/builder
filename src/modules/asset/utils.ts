import { Asset, RawAsset } from 'modules/asset/types'
import { COLLECTIBLE_ASSET_PACK_ID, CategoryName } from 'modules/ui/sidebar/utils'

export const MAX_TAGS = 15
export const MAX_NAME_LENGTH = 20

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

export function isGround(asset: Asset | RawAsset) {
  return asset.category === CategoryName.GROUND_CATEGORY
}

export function cleanAssetName(fileName: string) {
  const matches = /(.*)\.(.*)/g.exec(fileName)
  let out = fileName

  if (matches && matches.length) {
    const matched = matches[1]
    out = matched.replace(/[\.\-\_]/g, ' ')
  }

  return (out.charAt(0).toUpperCase() + out.slice(1)).slice(0, MAX_NAME_LENGTH)
}

export function rawMappingsToObjectURL(mappings: Record<string, Blob>) {
  let out: Record<string, string> = {}

  for (let key in mappings) {
    const item = mappings[key]
    out[key] = URL.createObjectURL(item)
  }

  return out
}

export function revokeMappingsObjectURL(mappings: Record<string, string>) {
  for (let key in mappings) {
    const item = mappings[key]
    URL.revokeObjectURL(item)
  }
}
