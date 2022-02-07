import { ThumbnailType } from 'lib/getModelData'
import { InvalidContentPath, InvalidEnumValue } from 'modules/item/errors'
import { WearableCategory } from 'modules/item/types'
import { ItemAssetJson } from './CreateSingleItemModal.types'

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

export function validateEnum(name: keyof ItemAssetJson, assetJson: ItemAssetJson, values: string[] = []) {
  const value = assetJson[name]
  if (value && !values.includes(value)) {
    throw new InvalidEnumValue(value!, values, name)
  }
}
