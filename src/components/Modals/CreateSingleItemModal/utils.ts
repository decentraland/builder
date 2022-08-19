import { BodyShape, WearableCategory, WearableWithBlobs } from '@dcl/schemas'
import { ThumbnailType } from 'lib/getModelData'
import { isImageFile, isModelFile } from 'modules/item/utils'

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

export function toWearableWithBlobs({
  contents,
  file,
  isEmote = false
}: {
  contents?: Record<string, Blob>
  file?: File
  isEmote: boolean
}): WearableWithBlobs {
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
    },
    ...(isEmote ? { emoteDataV0: { loop: false } } : {})
  }
}
