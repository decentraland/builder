import { Asset } from 'modules/asset/types'

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
