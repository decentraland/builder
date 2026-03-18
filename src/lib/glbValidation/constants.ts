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

/** Maximum texture width/height in pixels for standard wearables. */
export const MAX_TEXTURE_RESOLUTION_DEFAULT = 512
/** Maximum texture width/height in pixels for facial wearables (eyebrows, eyes, mouth). */
export const MAX_TEXTURE_RESOLUTION_FACIAL = 256

/** Wearable categories that use the stricter facial texture resolution limit. */
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
/** Maximum root-bone displacement in meters during an emote animation. */
export const EMOTE_MAX_DISPLACEMENT_METERS = 1

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

/** Accepted audio file extensions for emote sound effects. */
export const VALID_AUDIO_EXTENSIONS = ['.mp3', '.ogg']
