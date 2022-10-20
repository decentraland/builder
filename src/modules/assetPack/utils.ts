import { FullAssetPack, MixedAssetPack } from './types'
import { RawAssetContents, Asset, RawAsset } from 'modules/asset/types'
import { getContentsHash } from 'modules/asset/utils'
import { dataURLToBlob, isDataUrl, blobToHash } from 'modules/media/utils'
import { getContentsStorageUrl } from 'lib/api/builder'

export const MAX_TITLE_LENGTH = 20
export const MIN_TITLE_LENGTH = 3
export const MAX_THUMBNAIL_SIZE = 5000000
export const THUMBNAIL_PATH = 'thumbnail.png'

export async function convertToFullAssetPack(
  rawAssetPack: MixedAssetPack,
  ignoredAssets: string[] = []
): Promise<[FullAssetPack, RawAssetContents]> {
  const fullAssetPack: FullAssetPack = { ...rawAssetPack, assets: [] }
  const rawContents: RawAssetContents = {}

  for (const asset of rawAssetPack.assets) {
    const { contents, thumbnail } = asset
    const isIgnored = ignoredAssets.includes(asset.id)
    rawContents[asset.id] = {}

    // generate { [path]: "cid" } mappings
    const newAsset: Asset = {
      ...asset,
      contents: {}
    }

    if (!isIgnored) {
      newAsset.contents = await getContentsHash(asset as RawAsset)
    } else {
      newAsset.contents = (asset as Asset).contents
    }

    // save rawContents as { [cid]: Blob }
    for (const path of Object.keys(newAsset.contents)) {
      const cid = newAsset.contents[path]
      if (!isIgnored) {
        rawContents[asset.id][cid] = (contents as RawAsset['contents'])[path]
      }
    }

    // add thumbnail (it's not needed in asset.contents, but added to asset.thumbnail instead)
    if (isDataUrl(thumbnail)) {
      const blob = dataURLToBlob(thumbnail)!
      const cid = await blobToHash(blob, THUMBNAIL_PATH)
      newAsset.thumbnail = getContentsStorageUrl(cid)
      newAsset.model = `${asset.assetPackId}/${asset.model}`
      rawContents[asset.id][cid] = blob
    }

    // add asset
    fullAssetPack.assets.push(newAsset)
  }

  return [fullAssetPack, rawContents]
}

export function getAssetPackFileCount(assetPack: FullAssetPack): number {
  let count = 0

  for (const asset of assetPack.assets) {
    count += Object.keys(asset.contents).length
  }

  return count
}
