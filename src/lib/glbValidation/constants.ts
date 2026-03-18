import { WearableCategory } from '@dcl/schemas'

// Triangle limits per wearable category
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

// When category is unknown, use the most permissive non-skin limit
export const MAX_TRIANGLE_LIMIT_UNKNOWN_CATEGORY = 1500

// Dimension limits in meters
export const MAX_DIMENSIONS = {
  height: 2.42,
  width: 2.42,
  depth: 1.4
}

// Material and texture limits
export const MAX_MATERIALS_DEFAULT = 2
export const MAX_MATERIALS_SKIN = 5
export const MAX_TEXTURES_DEFAULT = 2
export const MAX_TEXTURES_SKIN = 5

// Texture resolution limits (pixels)
export const MAX_TEXTURE_RESOLUTION_DEFAULT = 512
export const MAX_TEXTURE_RESOLUTION_FACIAL = 256

// Facial categories that have stricter texture limits
export const FACIAL_CATEGORIES: WearableCategory[] = [
  WearableCategory.EYEBROWS,
  WearableCategory.EYES,
  WearableCategory.MOUTH
]

// Bone/rigging limits
export const MAX_BONE_INFLUENCES_PER_VERTEX = 4

// Material naming
export const AVATAR_SKIN_MAT = 'AvatarSkin_MAT'
export const FORBIDDEN_MATERIAL_PATTERNS = ['_mouth', '_eyebrows', '_eyes']

// Emote limits
export const EMOTE_EXPECTED_FPS = 30
export const EMOTE_FPS_TOLERANCE = 5 // Allow +-5 fps deviation before warning
export const EMOTE_MAX_FRAMES = 300
export const EMOTE_MAX_ANIMATION_CLIPS_BASIC = 1
export const EMOTE_MAX_ANIMATION_CLIPS_WITH_PROPS = 2
export const EMOTE_MAX_DISPLACEMENT_METERS = 1

// Prop limits
export const PROP_MAX_TRIANGLES = 3000
export const PROP_MAX_MATERIALS = 2
export const PROP_MAX_TEXTURES = 2
export const PROP_MAX_ARMATURE_BONES = 62

// Armature naming conventions
export const AVATAR_ARMATURE_NAME = 'Armature'
export const PROP_ARMATURE_NAME = 'Armature_Prop'

// Valid audio formats for emotes
export const VALID_AUDIO_EXTENSIONS = ['.mp3', '.ogg']
