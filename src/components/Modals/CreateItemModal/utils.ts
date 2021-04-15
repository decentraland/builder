import { ThumbnailType } from 'lib/getModelData'
import { WearableCategory } from 'modules/item/types'

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
