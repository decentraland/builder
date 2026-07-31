import { WearableCategory } from '@dcl/schemas'
import { ThumbnailType, EngineType } from './getModelData'
import { getThumbnailType, getThumbnailRenderOptions, THUMBNAIL_POSE_BY_CATEGORY, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT } from './thumbnailOptions'

describe('getThumbnailType', () => {
  it.each([
    WearableCategory.EYEBROWS,
    WearableCategory.EYES,
    WearableCategory.MASK,
    WearableCategory.MOUTH,
    WearableCategory.SKIN,
    WearableCategory.UPPER_BODY
  ])('should return FRONT for %s', (category) => {
    expect(getThumbnailType(category)).toBe(ThumbnailType.FRONT)
  })

  it.each([
    WearableCategory.HAT,
    WearableCategory.HELMET,
    WearableCategory.LOWER_BODY,
    WearableCategory.FEET,
    WearableCategory.HAIR,
    WearableCategory.EARRING,
    WearableCategory.TIARA,
    WearableCategory.FACIAL_HAIR
  ])('should return DEFAULT for %s', (category) => {
    expect(getThumbnailType(category)).toBe(ThumbnailType.DEFAULT)
  })
})

describe('THUMBNAIL_POSE_BY_CATEGORY', () => {
  it('should map UPPER_BODY and SKIN to a pose', () => {
    expect(THUMBNAIL_POSE_BY_CATEGORY[WearableCategory.UPPER_BODY]).toBeDefined()
    expect(THUMBNAIL_POSE_BY_CATEGORY[WearableCategory.SKIN]).toBeDefined()
  })

  it('should use the same pose for UPPER_BODY and SKIN', () => {
    expect(THUMBNAIL_POSE_BY_CATEGORY[WearableCategory.UPPER_BODY]).toBe(
      THUMBNAIL_POSE_BY_CATEGORY[WearableCategory.SKIN]
    )
  })

  it('should not map other categories', () => {
    expect(THUMBNAIL_POSE_BY_CATEGORY[WearableCategory.HAT]).toBeUndefined()
    expect(THUMBNAIL_POSE_BY_CATEGORY[WearableCategory.LOWER_BODY]).toBeUndefined()
    expect(THUMBNAIL_POSE_BY_CATEGORY[WearableCategory.FEET]).toBeUndefined()
  })
})

describe('getThumbnailRenderOptions', () => {
  it('should return complete options for a posed category', () => {
    const options = getThumbnailRenderOptions(WearableCategory.UPPER_BODY, 'model.glb')

    expect(options.width).toBe(THUMBNAIL_WIDTH)
    expect(options.height).toBe(THUMBNAIL_HEIGHT)
    expect(options.thumbnailType).toBe(ThumbnailType.FRONT)
    expect(options.extension).toBe('.glb')
    expect(options.engine).toBe(EngineType.BABYLON)
    expect(options.pose).toBeDefined()
  })

  it('should return undefined pose for non-posed category', () => {
    const options = getThumbnailRenderOptions(WearableCategory.HAT, 'model.glb')

    expect(options.pose).toBeUndefined()
    expect(options.thumbnailType).toBe(ThumbnailType.DEFAULT)
  })

  it('should extract the file extension from the model name', () => {
    const options = getThumbnailRenderOptions(WearableCategory.UPPER_BODY, 'avatar.gltf')
    expect(options.extension).toBe('.gltf')
  })

  it('should fall back to .glb when the model has no extension', () => {
    const options = getThumbnailRenderOptions(WearableCategory.UPPER_BODY, 'model')
    expect(options.extension).toBe('.glb')
  })
})
