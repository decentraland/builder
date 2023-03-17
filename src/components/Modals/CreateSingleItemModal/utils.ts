import { BodyShape, EmoteCategory, EmoteWithBlobs, WearableCategory, WearableWithBlobs } from '@dcl/schemas'
import { ThumbnailType } from 'lib/getModelData'
import { isImageFile, isModelFile } from 'modules/item/utils'
import { ModelMetrics } from 'modules/models/types'

export const THUMBNAIL_WIDTH = 1024
export const THUMBNAIL_HEIGHT = 1024

export enum VALID_WEARABLES_METRICS_TRIANGLES {
  GENERAL = 1500,
  ACCESSORY = 500,
  SKIN = 5000
}

export enum VALID_WEARABLES_METRICS_TEXTURES {
  GENERAL = 2,
  ACCESSORY = 2,
  SKIN = 5
}

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

export function toWearableWithBlobs({ contents, file }: { contents?: Record<string, Blob>; file?: File }): WearableWithBlobs {
  const mainGLBFile = contents && Object.keys(contents).find(content => isModelFile(content))
  const mainPNGFile = contents && Object.keys(contents).find(content => isImageFile(content))
  const mainFile = mainGLBFile || mainPNGFile
  if (contents && !mainFile) {
    throw Error('Not valid main content')
  }
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
          mainFile: mainFile || 'model.glb',
          contents: contents
            ? Object.entries(contents).map(([key, value]) => ({ key, blob: value }))
            : file
            ? [
                {
                  key: 'model.glb',
                  blob: file
                }
              ]
            : [],
          overrideHides: [],
          overrideReplaces: []
        }
      ]
    }
  }
}

export function toEmoteWithBlobs({ contents, file }: { contents?: Record<string, Blob>; file?: File }): EmoteWithBlobs {
  const mainFile = contents && Object.keys(contents).find(content => isModelFile(content))
  if (contents && !mainFile) {
    throw Error('Not valid main content')
  }
  return {
    id: 'some-id',
    name: '',
    description: '',
    image: '',
    thumbnail: '',
    i18n: [],
    emoteDataADR74: {
      category: EmoteCategory.DANCE,
      tags: [],
      representations: [
        {
          bodyShapes: [BodyShape.MALE, BodyShape.FEMALE],
          mainFile: mainFile || 'model.glb',
          contents: contents
            ? Object.entries(contents).map(([key, value]) => ({ key, blob: value }))
            : file
            ? [
                {
                  key: 'model.glb',
                  blob: file
                }
              ]
            : []
        }
      ],
      loop: false
    }
  }
}

export function isWearableCategoryGeneral(category: WearableCategory): boolean {
  return [
    WearableCategory.HAIR,
    WearableCategory.EYEBROWS,
    WearableCategory.EYES,
    WearableCategory.MOUTH,
    WearableCategory.FACIAL_HAIR,
    WearableCategory.UPPER_BODY,
    WearableCategory.LOWER_BODY,
    WearableCategory.FEET
  ].includes(category)
}

export function isWearableCategoryAccessory(category: WearableCategory): boolean {
  return [
    WearableCategory.EYEWEAR,
    WearableCategory.EARRING,
    WearableCategory.TIARA,
    WearableCategory.MASK,
    WearableCategory.HAT,
    WearableCategory.HELMET,
    WearableCategory.TOP_HEAD
  ].includes(category)
}

export function isWearableCategorySkin(category: WearableCategory): boolean {
  return WearableCategory.SKIN === category
}

export function getWearableTrianglesLimit(category: WearableCategory) {
  if (isWearableCategoryGeneral(category)) {
    return VALID_WEARABLES_METRICS_TRIANGLES.GENERAL
  } else if (isWearableCategoryAccessory(category)) {
    return VALID_WEARABLES_METRICS_TRIANGLES.ACCESSORY
  } else if (isWearableCategorySkin(category)) {
    return VALID_WEARABLES_METRICS_TRIANGLES.SKIN
  } else {
    return 0
  }
}

export function isValidWearableTriangles(metrics: ModelMetrics, category: WearableCategory): boolean {
  return metrics.triangles <= getWearableTrianglesLimit(category)
}

export function getWearableTexturesLimit(category: WearableCategory) {
  if (isWearableCategoryGeneral(category)) {
    return VALID_WEARABLES_METRICS_TEXTURES.GENERAL
  } else if (isWearableCategoryAccessory(category)) {
    return VALID_WEARABLES_METRICS_TEXTURES.ACCESSORY
  } else if (isWearableCategorySkin(category)) {
    return VALID_WEARABLES_METRICS_TEXTURES.SKIN
  } else {
    return 0
  }
}

export function isValidWearableTextures(metrics: ModelMetrics, category: WearableCategory): boolean {
  return metrics.textures <= getWearableTexturesLimit(category)
}

export function isValidWearableMetrics(metrics: ModelMetrics, category: WearableCategory): boolean {
  return isValidWearableTriangles(metrics, category) && isValidWearableTextures(metrics, category)
}
