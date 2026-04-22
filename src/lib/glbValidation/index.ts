import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { WearableCategory } from '@dcl/schemas'
import { ValidationIssue, ValidationResult, ValidationSeverity } from './types'
import { getEffectiveTriangleLimit } from './constants'
import {
  validateTriangleCounts,
  validateDimensions,
  validateMaterials,
  validateTextures,
  validateBoneInfluences,
  validateNoLeafBones,
  validateNoDisallowedObjects,
  validateMaterialNaming,
  validateNoNonDeformBones,
  validateSpringBones
} from './wearableValidators'
import {
  validateEmoteFrameRate,
  validateEmoteMaxFrames,
  validateEmoteAnimationClipCount,
  validateEmoteDeformBoneKeyframes,
  validatePropTriangles,
  validatePropMaterials,
  validatePropTextures,
  validatePropArmatureBones,
  validateArmatureNaming,
  validateAnimationNaming,
  validateAudioFormat
} from './emoteValidators'
export { ValidationSeverity } from './types'
export type { ValidationIssue, ValidationResult } from './types'
export { getEffectiveTriangleLimit } from './constants'

/**
 * Runs all wearable-specific validations against a parsed GLTF model.
 * Checks dimensions, materials, textures, bone influences,
 * leaf bones, disallowed objects, and material naming conventions.
 * Triangle counts are only checked when a category is provided.
 * @param gltf - The parsed GLTF loaded by Three.js.
 * @param category - Optional wearable category; limits are adjusted when provided.
 * @param hides - Optional list of categories this wearable hides (for Tris Combiner).
 */
export async function validateWearableGLTF(gltf: GLTF, category?: WearableCategory, hides?: string[]): Promise<ValidationResult> {
  const Three = await import('three')
  const { scene } = gltf

  const issueArrays = [
    // Triangle counts require category + hides to be meaningful; skip at import time
    ...(category ? [validateTriangleCounts(Three, scene, category, hides)] : []),
    validateDimensions(Three, scene),
    validateMaterials(Three, scene, category),
    validateTextures(Three, scene, category),
    validateBoneInfluences(Three, scene),
    validateNoLeafBones(Three, scene),
    validateNoNonDeformBones(Three, scene),
    validateNoDisallowedObjects(Three, gltf),
    validateMaterialNaming(Three, scene, category),
    validateSpringBones(gltf)
  ]

  const issues = issueArrays.flat()
  return {
    issues,
    isValid: issues.every(i => i.severity !== ValidationSeverity.ERROR)
  }
}

/**
 * Runs all emote-specific validations against a parsed GLTF model.
 * Checks frame rate, max frames, clip count, deform-bone keyframes,
 * root displacement, armature/animation naming, and (when props are present)
 * prop triangle/material/texture/bone limits. Audio format is validated
 * when {@link contents} is provided.
 * @param gltf - The parsed GLTF loaded by Three.js.
 * @param hasProps - Whether the emote includes prop assets.
 * @param contents - Optional file map used for audio format validation.
 */
export async function validateEmoteGLTF(gltf: GLTF, hasProps: boolean, contents?: Record<string, Blob>): Promise<ValidationResult> {
  const Three = await import('three')
  const { scene, animations } = gltf

  const issueArrays = [
    validateEmoteFrameRate(animations),
    validateEmoteMaxFrames(animations),
    validateEmoteAnimationClipCount(animations, hasProps),
    validateEmoteDeformBoneKeyframes(Three, scene, animations),
    validateNoNonDeformBones(Three, scene),
    validateArmatureNaming(scene),
    validateAnimationNaming(animations, hasProps)
  ]

  // Props-specific validations
  if (hasProps) {
    issueArrays.push(
      validatePropTriangles(Three, scene),
      validatePropMaterials(Three, scene),
      validatePropTextures(Three, scene),
      validatePropArmatureBones(Three, scene)
    )
  }

  // Audio validation
  if (contents) {
    issueArrays.push(validateAudioFormat(contents))
  }

  const issues = issueArrays.flat()
  return {
    issues,
    isValid: issues.every(i => i.severity !== ValidationSeverity.ERROR)
  }
}

/**
 * Re-run only category-dependent validations for wearables.
 * Used when the user selects/changes a category in the details step.
 */
export async function revalidateWearableForCategory(gltf: GLTF, category: WearableCategory, hides?: string[]): Promise<ValidationResult> {
  const Three = await import('three')
  const { scene } = gltf

  const issueArrays = [
    validateTriangleCounts(Three, scene, category, hides),
    validateMaterials(Three, scene, category),
    validateTextures(Three, scene, category),
    validateMaterialNaming(Three, scene, category)
  ]

  const issues = issueArrays.flat()
  return {
    issues,
    isValid: issues.every(i => i.severity !== ValidationSeverity.ERROR)
  }
}

/**
 * Lightweight triangle count check using pre-computed metrics (no GLTF reload needed).
 * Used in the CreateSingleItemModal when the user selects a category but hides are not yet configured.
 * Returns the triangle issue (with hint about Tris Combiner) or null if within limits.
 */
export function checkTriangleCount(triangles: number, category: WearableCategory, hides?: string[]): ValidationIssue | null {
  const limit = getEffectiveTriangleLimit(category, hides)
  if (triangles <= limit) return null

  const hasHidesInfo = hides !== undefined && hides.length > 0
  return {
    code: 'TRIANGLE_COUNT_EXCEEDED',
    severity: ValidationSeverity.WARNING,
    messageKey: hasHidesInfo
      ? 'create_single_item_modal.error.glb_validation.triangle_count_exceeded'
      : 'create_single_item_modal.error.glb_validation.triangle_count_exceeded_with_hint',
    messageParams: { count: triangles, limit, category }
  }
}
