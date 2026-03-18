import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { WearableCategory } from '@dcl/schemas'
import { ValidationResult, ValidationSeverity } from './types'
import {
  validateTriangleCounts,
  validateDimensions,
  validateMaterials,
  validateTextures,
  validateBoneInfluences,
  validateNoLeafBones,
  validateNoDisallowedObjects,
  validateMaterialNaming
} from './wearableValidators'
import {
  validateEmoteFrameRate,
  validateEmoteMaxFrames,
  validateEmoteAnimationClipCount,
  validateEmoteDeformBoneKeyframes,
  validateEmoteDisplacement,
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

export async function validateWearableGLTF(gltf: GLTF, category?: WearableCategory): Promise<ValidationResult> {
  const Three = await import('three')
  const { scene } = gltf

  const issueArrays = [
    validateTriangleCounts(Three, scene, category),
    validateDimensions(Three, scene),
    validateMaterials(Three, scene, category),
    validateTextures(Three, scene, category),
    validateBoneInfluences(Three, scene),
    validateNoLeafBones(Three, scene),
    validateNoDisallowedObjects(Three, gltf),
    validateMaterialNaming(Three, scene, category)
  ]

  const issues = issueArrays.flat()
  return {
    issues,
    isValid: issues.every(i => i.severity !== ValidationSeverity.ERROR)
  }
}

export async function validateEmoteGLTF(
  gltf: GLTF,
  hasProps: boolean,
  contents?: Record<string, Blob>
): Promise<ValidationResult> {
  const Three = await import('three')
  const { scene, animations } = gltf

  const issueArrays = [
    validateEmoteFrameRate(animations),
    validateEmoteMaxFrames(animations),
    validateEmoteAnimationClipCount(animations, hasProps),
    validateEmoteDeformBoneKeyframes(Three, scene, animations),
    validateEmoteDisplacement(animations),
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
export async function revalidateWearableForCategory(
  gltf: GLTF,
  category: WearableCategory
): Promise<ValidationResult> {
  const Three = await import('three')
  const { scene } = gltf

  const issueArrays = [
    validateTriangleCounts(Three, scene, category),
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
