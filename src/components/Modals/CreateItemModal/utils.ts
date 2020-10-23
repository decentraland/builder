import { WearableCategory } from 'modules/item/types'

export const getThumbnailType = (category: WearableCategory) => {
  switch (category) {
    case WearableCategory.EYEBROWS:
    case WearableCategory.EYES:
    case WearableCategory.MASK:
    case WearableCategory.MOUTH:
      return 'front' as const
    default:
      return 'default' as const
  }
}
