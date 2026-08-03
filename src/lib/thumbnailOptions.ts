import { WearableCategory } from '@dcl/schemas'
import poseNicerIdle from 'poses/pose_nicer_idle.glb?url'
import { EngineType, type Options, ThumbnailType } from './getModelData'
import { getExtension } from './file'

export const THUMBNAIL_WIDTH = 1024
export const THUMBNAIL_HEIGHT = 1024

export const THUMBNAIL_POSE_BY_CATEGORY: Partial<Record<WearableCategory, string>> = {
  [WearableCategory.UPPER_BODY]: poseNicerIdle,
  [WearableCategory.SKIN]: poseNicerIdle
}

export const getThumbnailType = (category: WearableCategory): ThumbnailType => {
  switch (category) {
    case WearableCategory.EYEBROWS:
    case WearableCategory.EYES:
    case WearableCategory.MASK:
    case WearableCategory.MOUTH:
    case WearableCategory.SKIN:
    case WearableCategory.UPPER_BODY:
      return ThumbnailType.FRONT
    default:
      return ThumbnailType.DEFAULT
  }
}

export const getThumbnailRenderOptions = (category: WearableCategory, model: string): Options => ({
  width: THUMBNAIL_WIDTH,
  height: THUMBNAIL_HEIGHT,
  thumbnailType: getThumbnailType(category),
  extension: getExtension(model) ?? '.glb',
  engine: EngineType.BABYLON,
  pose: THUMBNAIL_POSE_BY_CATEGORY[category]
})
