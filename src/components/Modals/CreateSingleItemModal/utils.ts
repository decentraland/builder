import { BodyShape, WearableCategory, WearableWithBlobs } from '@dcl/schemas'
import { ThumbnailType } from 'lib/getModelData'
import { InvalidContentPath, InvalidEnumValue } from 'modules/item/errors'
import { ItemAssetJson } from './CreateSingleItemModal.types'

export const THUMBNAIL_WIDTH = 1024
export const THUMBNAIL_HEIGHT = 1024

export const getThumbnailType = (category: WearableCategory) => {
  switch (category) {
    case WearableCategory.EYEBROWS:
    case WearableCategory.EYES:
    case WearableCategory.MASK:
    case WearableCategory.MOUTH:
    case WearableCategory.SKIN:
      return ThumbnailType.FRONT
    default:
      return ThumbnailType.DEFAULT
  }
}

export function validatePath(path: keyof ItemAssetJson, assetJson: ItemAssetJson, contents: Record<string, Blob>) {
  if (assetJson[path] && !(assetJson[path]! in contents)) {
    throw new InvalidContentPath(assetJson[path]!, path)
  }
}

export function validateEnum(name: keyof ItemAssetJson, assetJson: ItemAssetJson, values: any[] = []) {
  const value = assetJson[name]
  if (value && !values.includes(value)) {
    throw new InvalidEnumValue(value!, values, name)
  }
}

export function toWearableWithBlobs(file: File, isEmote = false): WearableWithBlobs {
  return {
    id: 'some-id',
    name: '',
    description: '',
    image: '',
    thumbnail: '',
    i18n: [],
    data: {
      category: WearableCategory.HAT,
      hides: [],
      replaces: [],
      tags: [],
      representations: [
        {
          bodyShapes: [BodyShape.MALE, BodyShape.FEMALE],
          mainFile: 'model.glb',
          contents: [
            {
              key: 'model.glb',
              blob: file
            }
          ],
          overrideHides: [],
          overrideReplaces: []
        }
      ]
    },
    ...(isEmote ? { emoteDataV0: { loop: false } } : {})
  }
}
