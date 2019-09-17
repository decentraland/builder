import { RawAssetPack, FullAssetPack } from './types'
import { RawAssetContents } from 'modules/asset/types'
import { getContentsCID } from 'modules/asset/utils'

export const MAX_TITLE_LENGTH = 20
export const MIN_TITLE_LENGTH = 3
export const MAX_THUMBNAIL_SIZE = 5000000

export async function rawAssetPackToFullAssetPack(rawAssetPack: RawAssetPack): Promise<[FullAssetPack, RawAssetContents]> {
  const fullAssetPack: FullAssetPack = { ...rawAssetPack, assets: [] }
  const rawContents: RawAssetContents = {}

  for (let asset of rawAssetPack.assets) {
    const { contents } = asset
    rawContents[asset.id] = {}
    const newAsset = {
      ...asset,
      contents: await getContentsCID(asset)
    }
    // save rawContents as "cid": Blob
    for (const path of Object.keys(newAsset.contents)) {
      const cid = newAsset.contents[path]
      rawContents[asset.id][cid] = contents[path]
    }
    fullAssetPack.assets.push(newAsset)
  }

  return [fullAssetPack, rawContents]
}

export function getAssetPackFileCount(assetPack: FullAssetPack): number {
  let count = 0

  for (let asset of assetPack.assets) {
    count += Object.keys(asset.contents).length
  }

  return count
}
