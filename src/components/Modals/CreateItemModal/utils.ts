import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { ThumbnailType } from 'lib/getModelData'
import { ItemRarity, WearableCategory } from 'modules/item/types'

const SIMPLE_WEARABLE_CATEGRORIES = [WearableCategory.EYEBROWS, WearableCategory.EYES, WearableCategory.MOUTH]

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

export function getRarities() {
  return Object.values(ItemRarity).map(value => ({ value, text: t(`wearable.rarity.${value}`) }))
}

export function getCategories(contents: Record<string, Blob> | undefined = {}) {
  const fileNames = Object.keys(contents)

  let categories = Object.values(WearableCategory)
  if (fileNames.some(isComplexFile)) {
    categories = categories.filter(category => !SIMPLE_WEARABLE_CATEGRORIES.includes(category))
  }

  return categories.map(value => ({ value, text: t(`wearable.category.${value}`) }))
}

export function isComplexFile(fileName: string) {
  return fileName.endsWith('.gltf') || fileName.endsWith('.glb')
}
