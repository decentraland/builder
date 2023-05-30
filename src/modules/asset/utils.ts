import { hashV1 } from '@dcl/hashing'
import { Asset, RawAsset } from 'modules/asset/types'
import { COLLECTIBLE_ASSET_PACK_ID, CategoryName } from 'modules/ui/sidebar/utils'
import { makeContentFile } from 'modules/deployment/utils'

export const MAX_TAGS = 15
export const MAX_NAME_LENGTH = 30
export const MIN_NAME_LENGTH = 3
export const MAX_FILE_SIZE = 26214400 // 25MB

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
    out = matched.replace(/[.\-_]/g, ' ')
  }

  return (out.charAt(0).toUpperCase() + out.slice(1)).slice(0, MAX_NAME_LENGTH)
}

export function rawMappingsToObjectURL(mappings: Record<string, Blob>) {
  const out: Record<string, string> = {}

  for (const key in mappings) {
    const item = mappings[key]
    out[key] = URL.createObjectURL(item)
  }

  return out
}

export function revokeMappingsObjectURL(mappings: Record<string, string>) {
  for (const key in mappings) {
    const item = mappings[key]
    URL.revokeObjectURL(item)
  }
}

export async function getContentsHash(asset: RawAsset): Promise<Record<string, string>> {
  const { contents } = asset
  const out: Record<string, string> = {}

  for (const filePath of Object.keys(contents)) {
    const file = await makeContentFile(filePath, contents[filePath])
    out[filePath] = await hashV1(file.content)
  }
  return out
}
