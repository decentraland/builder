import { ThumbnailType } from 'lib/getModelData'
import { WearableCategory } from 'modules/item/types'
import { ItemAssetJson } from './CreateItemModal.types'

export const getThumbnailType = (category: WearableCategory) => {
  switch (category) {
    case WearableCategory.EYEBROWS:
    case WearableCategory.EYES:
    case WearableCategory.MASK:
    case WearableCategory.MOUTH:
      return ThumbnailType.FRONT
    default:
      return ThumbnailType.DEFAULT
  }
}

export function validatePath(path: keyof ItemAssetJson, assetJson: ItemAssetJson, contents: Record<string, Blob>) {
  if (assetJson[path] && !(assetJson[path]! in contents)) {
    throw new Error(`Invalid path "${assetJson[path]}" for property "${path}", file not found.`)
  }
}

export function validateEnum<T>(value?: T, values: T[] = []) {
  if (value && !values.includes(value)) {
    throw new Error(`Invalid value "${value}", possible values: ${values.map(v => `"${v}"`).join(', ')}.`)
  }
}
