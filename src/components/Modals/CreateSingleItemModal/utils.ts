import {
  ArmatureId,
  BodyShape,
  ContractAddress,
  ContractNetwork,
  EmoteCategory,
  EmoteClip,
  EmoteWithBlobs,
  Mapping,
  MappingType,
  OutcomeGroup,
  StartAnimation,
  WearableCategory,
  WearableWithBlobs
} from '@dcl/schemas'
import { ThumbnailType } from 'lib/getModelData'
import { LinkedContract } from 'modules/thirdParty/types'
import { isImageFile, isModelFile } from 'modules/item/utils'
import { Collection } from 'modules/collection/types'
import { BodyShapeType, THUMBNAIL_PATH, VIDEO_PATH, WearableRepresentation } from 'modules/item/types'
import { SortedContent } from './CreateSingleItemModal.types'

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
      removesDefaultHiding: [],
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
      ],
      blockVrmExport: false,
      outlineCompatible: true
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

/**
 * Prefixes the content name by adding the adding the body shape name to it.
 *
 * @param bodyShape - The body shaped used to prefix the content name.
 * @param contentKey - The content key or name to be prefixed.
 */
const prefixContentName = (bodyShape: BodyShapeType, contentKey: string): string => {
  return `${bodyShape}/${contentKey}`
}

/**
 * Creates a new contents record with the names of the contents blobs record prefixed.
 * The names need to be prefixed so they won't collide with other
 * pre-uploaded models. The name of the content is the name of the uploaded file.
 *
 * @param bodyShape - The body shaped used to prefix the content names.
 * @param contents - The contents which keys are going to be prefixed.
 */
const prefixContents = (bodyShape: BodyShapeType, contents: Record<string, Blob>): Record<string, Blob> => {
  return Object.keys(contents).reduce((newContents: Record<string, Blob>, key: string) => {
    // Do not include the thumbnail, scenes, and video in each of the body shapes
    if ([THUMBNAIL_PATH, VIDEO_PATH].includes(key)) {
      return newContents
    }
    newContents[prefixContentName(bodyShape, key)] = contents[key]
    return newContents
  }, {})
}

/**
 * Sorts the content into "male", "female" and "all" taking into consideration the body shape.
 * All contains the item thumbnail and both male and female representations according to the shape.
 * If the body representation is male, "female" will be an empty object and viceversa.
 *
 * @param bodyShape - The body shaped used to sort the content.
 * @param contents - The contents to be sorted.
 */
export const sortContent = (bodyShape: BodyShapeType, contents: Record<string, Blob>): SortedContent => {
  const male = bodyShape === BodyShapeType.BOTH || bodyShape === BodyShapeType.MALE ? prefixContents(BodyShapeType.MALE, contents) : {}
  const female =
    bodyShape === BodyShapeType.BOTH || bodyShape === BodyShapeType.FEMALE ? prefixContents(BodyShapeType.FEMALE, contents) : {}

  const all: Record<string, Blob> = {
    [THUMBNAIL_PATH]: contents[THUMBNAIL_PATH],
    ...male,
    ...female
  }

  if (contents[VIDEO_PATH]) {
    all[VIDEO_PATH] = contents[VIDEO_PATH]
  }

  return { male, female, all }
}

export const sortContentZipBothBodyShape = (bodyShape: BodyShapeType, contents: Record<string, Blob>): SortedContent => {
  let male: Record<string, Blob> = {}
  let female: Record<string, Blob> = {}
  const both: Record<string, Blob> = {}

  for (const [key, value] of Object.entries(contents)) {
    if (key.startsWith('male/') && (bodyShape === BodyShapeType.BOTH || bodyShape === BodyShapeType.MALE)) {
      male[key] = value
    } else if (key.startsWith('female/') && (bodyShape === BodyShapeType.BOTH || bodyShape === BodyShapeType.FEMALE)) {
      female[key] = value
    } else {
      both[key] = value
    }
  }

  male = {
    ...male,
    ...(bodyShape === BodyShapeType.BOTH || bodyShape === BodyShapeType.MALE ? prefixContents(BodyShapeType.MALE, both) : {})
  }

  female = {
    ...female,
    ...(bodyShape === BodyShapeType.BOTH || bodyShape === BodyShapeType.FEMALE ? prefixContents(BodyShapeType.FEMALE, both) : {})
  }

  const all = {
    [THUMBNAIL_PATH]: contents[THUMBNAIL_PATH],
    ...male,
    ...female
  }

  return { male, female, all }
}

export const buildRepresentations = (bodyShape: BodyShapeType, model: string, contents: SortedContent): WearableRepresentation[] => {
  const representations: WearableRepresentation[] = []

  // add male representation
  if (bodyShape === BodyShapeType.MALE || bodyShape === BodyShapeType.BOTH) {
    representations.push({
      bodyShapes: [BodyShape.MALE],
      mainFile: prefixContentName(BodyShapeType.MALE, model),
      contents: Object.keys(contents.male),
      overrideHides: [],
      overrideReplaces: []
    })
  }

  // add female representation
  if (bodyShape === BodyShapeType.FEMALE || bodyShape === BodyShapeType.BOTH) {
    representations.push({
      bodyShapes: [BodyShape.FEMALE],
      mainFile: prefixContentName(BodyShapeType.FEMALE, model),
      contents: Object.keys(contents.female),
      overrideHides: [],
      overrideReplaces: []
    })
  }

  return representations
}

export const buildRepresentationsZipBothBodyshape = (bodyShape: BodyShapeType, contents: SortedContent): WearableRepresentation[] => {
  const representations: WearableRepresentation[] = []

  // add male representation
  if (bodyShape === BodyShapeType.MALE || bodyShape === BodyShapeType.BOTH) {
    representations.push({
      bodyShapes: [BodyShape.MALE],
      mainFile: Object.keys(contents.male).find(content => content.includes('glb'))!,
      contents: Object.keys(contents.male),
      overrideHides: [],
      overrideReplaces: []
    })
  }

  // add female representation
  if (bodyShape === BodyShapeType.FEMALE || bodyShape === BodyShapeType.BOTH) {
    representations.push({
      bodyShapes: [BodyShape.FEMALE],
      mainFile: Object.keys(contents.female).find(content => content.includes('glb'))!,
      contents: Object.keys(contents.female),
      overrideHides: [],
      overrideReplaces: []
    })
  }

  return representations
}

/**
 * Gets the default mappings for a third party contract
 */
export const getDefaultMappings = (
  contract: LinkedContract | undefined,
  isThirdPartyV2Enabled: boolean
): Partial<Record<ContractNetwork, Record<ContractAddress, Mapping[]>>> | undefined => {
  if (!isThirdPartyV2Enabled || !contract) {
    return undefined
  }

  return {
    [contract.network]: {
      [contract.address]: [{ type: MappingType.ANY }]
    }
  }
}

/**
 * Gets the linked contract from a collection
 */
export const getLinkedContract = (collection: Collection | undefined | null): LinkedContract | undefined => {
  if (!collection?.linkedContractAddress || !collection?.linkedContractNetwork) {
    return undefined
  }

  return {
    address: collection.linkedContractAddress,
    network: collection.linkedContractNetwork
  }
}

/**
 * Maps animation suffixes to their corresponding armature names
 */
const ANIMATION_TO_ARMATURE_MAP = {
  Avatar: ArmatureId.Armature,
  AvatarOther: ArmatureId.Armature_Other,
  Prop: ArmatureId.Armature_Prop
} as const

/**
 * Extracts the base name from an animation name by removing the suffix
 */
const getBaseAnimationName = (animationName: string): string => {
  // Remove common suffixes to get the base name
  const suffixes = ['_Start', '_Avatar', '_AvatarOther', '_Prop', '_Start_Prop']

  for (const suffix of suffixes) {
    if (animationName.endsWith(suffix)) {
      return animationName.slice(0, -suffix.length)
    }
  }

  return animationName
}

/**
 * Gets the armature name based on the animation name suffix
 */
const getArmatureFromAnimation = (animationName: string): ArmatureId => {
  if (animationName.endsWith('_AvatarOther')) {
    return ANIMATION_TO_ARMATURE_MAP.AvatarOther
  }
  if (animationName.endsWith('_Prop') || animationName.endsWith('_Start_Prop')) {
    return ANIMATION_TO_ARMATURE_MAP.Prop
  }
  // Default to Avatar for _Avatar, _Start, or no suffix
  return ANIMATION_TO_ARMATURE_MAP.Avatar
}

/**
 * Formats the base animation name into a title (e.g., "HighFive" -> "High Five")
 */
const formatAnimationTitle = (baseName: string): string => {
  // Convert camelCase/PascalCase to title case
  return baseName
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .trim()
}

/**
 * Checks if an animation is a start animation
 */
const isStartAnimation = (animationName: string): boolean => {
  return animationName.endsWith('_Start') || animationName.endsWith('_Start_Prop')
}

/**
 * Autocompletes emote data based on animation naming conventions
 */
export const autocompleteSocialEmoteData = (animations: string[]) => {
  const startAnimation: Partial<StartAnimation> = {}
  const outcomes: OutcomeGroup[] = []

  // Group animations by base name
  const animationGroups = new Map<string, string[]>()

  animations.forEach(animation => {
    const baseName = getBaseAnimationName(animation)
    const group = animationGroups.get(baseName) ?? []
    group.push(animation)
    animationGroups.set(baseName, group)
  })

  // Process each group
  animationGroups.forEach((groupAnimations, baseName) => {
    const title = formatAnimationTitle(baseName)

    // Find start animations
    const startAnimations = groupAnimations.filter(isStartAnimation)
    startAnimations.forEach(animation => {
      const armature = getArmatureFromAnimation(animation) as ArmatureId.Armature | ArmatureId.Armature_Prop
      startAnimation[armature] = { animation }
    })

    // Find outcome animations (non-start animations)
    const outcomeAnimations = groupAnimations.filter(anim => !isStartAnimation(anim))
    if (outcomeAnimations.length > 0) {
      const clips: Partial<Record<ArmatureId, EmoteClip>> = {}
      outcomeAnimations.forEach(animation => {
        const armature = getArmatureFromAnimation(animation)
        clips[armature] = { animation }
      })

      outcomes.push({
        title,
        clips,
        loop: false
      })
    }
  })

  return {
    startAnimation: Object.keys(startAnimation).length > 0 ? { ...startAnimation, loop: true } : undefined,
    outcomes: outcomes.length > 0 ? outcomes : undefined
  }
}
