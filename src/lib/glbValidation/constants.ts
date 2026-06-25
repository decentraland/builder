/**
 * @file Decentraland wearable and emote specification limits.
 *
 * These constants define the maximum allowed triangles, dimensions, materials,
 * textures, bones, and animation parameters for wearable and emote GLB assets
 * as specified by the Decentraland content validation rules.
 */

import { WearableCategory } from '@dcl/schemas'

/** Maximum triangle count allowed per wearable category. */
export const TRIANGLE_LIMITS: Partial<Record<WearableCategory, number>> = {
  // Small categories: 500 tris
  [WearableCategory.MASK]: 500,
  [WearableCategory.EYEWEAR]: 500,
  [WearableCategory.EARRING]: 500,
  [WearableCategory.TIARA]: 500,
  [WearableCategory.TOP_HEAD]: 500,
  [WearableCategory.FACIAL_HAIR]: 500,
  // Handwear (accessories): 1000 tris
  [WearableCategory.HANDS_WEAR]: 1000,
  // Standard categories: 1500 tris
  [WearableCategory.HAT]: 1500,
  [WearableCategory.HELMET]: 1500,
  [WearableCategory.HAIR]: 1500,
  [WearableCategory.UPPER_BODY]: 1500,
  [WearableCategory.LOWER_BODY]: 1500,
  [WearableCategory.FEET]: 1500,
  // Skin: 5000 tris
  [WearableCategory.SKIN]: 5000
}

/** Fallback triangle limit used when the wearable category is not yet known (most permissive non-skin limit). */
export const MAX_TRIANGLE_LIMIT_UNKNOWN_CATEGORY = 1500

/**
 * Calculates the effective triangle limit for a wearable, taking into account
 * the Tris Combiner rule: when a wearable hides other slots, their triangle
 * budgets are added to the base limit.
 *
 * @param category - The wearable's own category.
 * @param hides - The list of categories this wearable hides.
 * @returns The effective triangle limit.
 */
export function getEffectiveTriangleLimit(category: WearableCategory, hides: string[] = []): number {
  const baseLimit = TRIANGLE_LIMITS[category] ?? MAX_TRIANGLE_LIMIT_UNKNOWN_CATEGORY

  if (hides.length === 0) return baseLimit

  let combinedLimit = baseLimit
  for (const hidden of hides) {
    const hiddenLimit = TRIANGLE_LIMITS[hidden as WearableCategory]
    if (hiddenLimit) {
      combinedLimit += hiddenLimit
    }
  }

  return combinedLimit
}

/** Maximum bounding-box dimensions for a wearable, in meters. */
export const MAX_DIMENSIONS = {
  height: 2.42,
  width: 2.42,
  depth: 1.4
}

/** Maximum number of materials for non-skin wearables. */
export const MAX_MATERIALS_DEFAULT = 2
/** Maximum number of materials for the skin category. */
export const MAX_MATERIALS_SKIN = 5
/** Maximum number of textures for non-skin wearables. */
export const MAX_TEXTURES_DEFAULT = 2
/** Maximum number of textures for the skin category. */
export const MAX_TEXTURES_SKIN = 5

/** Wearable categories classified as facial (eyebrows, eyes, mouth). */
export const FACIAL_CATEGORIES: WearableCategory[] = [WearableCategory.EYEBROWS, WearableCategory.EYES, WearableCategory.MOUTH]

/** Maximum number of bone influences per vertex allowed in skinned meshes. */
export const MAX_BONE_INFLUENCES_PER_VERTEX = 4

/** Reserved material name for the avatar skin; excluded from material counts. */
export const AVATAR_SKIN_MAT = 'AvatarSkin_MAT'
/** Material name substrings that are forbidden in non-facial wearables. */
export const FORBIDDEN_MATERIAL_PATTERNS = ['_mouth', '_eyebrows', '_eyes']

/** Expected animation frame rate for emotes (fps). */
export const EMOTE_EXPECTED_FPS = 30
/** Allowed deviation from the expected fps before a warning is raised. */
export const EMOTE_FPS_TOLERANCE = 5
/** Maximum number of animation frames allowed in an emote. */
export const EMOTE_MAX_FRAMES = 300
/** Maximum animation clips for a basic (no-prop) emote. */
export const EMOTE_MAX_ANIMATION_CLIPS_BASIC = 1
/** Maximum animation clips for an emote that includes props. */
export const EMOTE_MAX_ANIMATION_CLIPS_WITH_PROPS = 2
/** Maximum triangle count for the prop armature in an emote. */
export const PROP_MAX_TRIANGLES = 3000
/** Maximum number of materials allowed on emote props. */
export const PROP_MAX_MATERIALS = 2
/** Maximum number of textures allowed on emote props. */
export const PROP_MAX_TEXTURES = 2
/** Maximum number of bones in the prop armature. */
export const PROP_MAX_ARMATURE_BONES = 62

/** Expected name of the avatar armature root node. */
export const AVATAR_ARMATURE_NAME = 'Armature'
/** Expected name of the prop armature root node. */
export const PROP_ARMATURE_NAME = 'Armature_Prop'

/**
 * Canonical Decentraland avatar skeleton bone names (62 bones).
 *
 * A wearable must be skinned to this skeleton; if its skinned-mesh joints reference
 * an unknown/misnamed skeleton the wearable breaks in-world and fails curation.
 * Built programmatically from the finger naming pattern to keep the list verifiable.
 *
 * The 62 bones break down as:
 *  - 6 spine/head (Hips, Spine, Spine1, Spine2, Neck, Head)
 *  - 8 arm chains (Shoulder, Arm, ForeArm, Hand per side × 2 sides)
 *  - 40 fingers (5 fingers × 4 joints × 2 hands), produced by handFingerBones()
 *  - 8 leg chains (UpLeg, Leg, Foot, ToeBase per side × 2 sides)
 */
const HAND_FINGERS = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky']
function handFingerBones(side: 'Left' | 'Right'): string[] {
  return HAND_FINGERS.flatMap(finger => [1, 2, 3, 4].map(segment => `Avatar_${side}Hand${finger}${segment}`))
}
export const AVATAR_BONE_NAMES: string[] = [
  // Spine and head
  'Avatar_Hips',
  'Avatar_Spine',
  'Avatar_Spine1',
  'Avatar_Spine2',
  'Avatar_Neck',
  'Avatar_Head',
  // Left arm and hand
  'Avatar_LeftShoulder',
  'Avatar_LeftArm',
  'Avatar_LeftForeArm',
  'Avatar_LeftHand',
  ...handFingerBones('Left'),
  // Right arm and hand
  'Avatar_RightShoulder',
  'Avatar_RightArm',
  'Avatar_RightForeArm',
  'Avatar_RightHand',
  ...handFingerBones('Right'),
  // Left leg
  'Avatar_LeftUpLeg',
  'Avatar_LeftLeg',
  'Avatar_LeftFoot',
  'Avatar_LeftToeBase',
  // Right leg
  'Avatar_RightUpLeg',
  'Avatar_RightLeg',
  'Avatar_RightFoot',
  'Avatar_RightToeBase'
]

/** Set form of {@link AVATAR_BONE_NAMES} for O(1) membership checks. */
export const AVATAR_BONE_NAME_SET = new Set(AVATAR_BONE_NAMES)

/**
 * Core avatar bones that every valid wearable skeleton must contain.
 * If any of these are missing from the skinned-mesh joints the skeleton is
 * considered wrong (non-DCL or misnamed), independent of optional fingers/toes.
 *
 * This is intentionally the minimal required subset, not the full skeleton. It omits
 * Spine1/Spine2 (extra spine segments) and LeftShoulder/RightShoulder so that simpler or
 * partial skeletons authored for accessories (which may not weight those bones) still pass,
 * while a genuinely non-DCL skeleton — missing Hips/Spine/Head/limbs — is still rejected.
 */
export const AVATAR_CORE_BONE_NAMES: string[] = [
  'Avatar_Hips',
  'Avatar_Spine',
  'Avatar_Neck',
  'Avatar_Head',
  'Avatar_LeftArm',
  'Avatar_LeftForeArm',
  'Avatar_LeftHand',
  'Avatar_RightArm',
  'Avatar_RightForeArm',
  'Avatar_RightHand',
  'Avatar_LeftUpLeg',
  'Avatar_LeftLeg',
  'Avatar_LeftFoot',
  'Avatar_RightUpLeg',
  'Avatar_RightLeg',
  'Avatar_RightFoot'
]

/** Accepted audio file extensions for emote sound effects. */
export const VALID_AUDIO_EXTENSIONS = ['.mp3', '.ogg']

/** Maximum number of spring bones allowed per wearable representation. */
export const MAX_SPRING_BONES = 12

/** Spring bone parameter ranges (from @dcl/schemas). */
export const SPRING_BONE_STIFFNESS_MIN = 0
export const SPRING_BONE_STIFFNESS_MAX = 4
export const SPRING_BONE_GRAVITY_POWER_MIN = 0
export const SPRING_BONE_GRAVITY_POWER_MAX = 2
export const SPRING_BONE_DRAG_MIN = 0
export const SPRING_BONE_DRAG_MAX = 1
export const SPRING_BONE_GRAVITY_DIR_MIN = -10
export const SPRING_BONE_GRAVITY_DIR_MAX = 10
