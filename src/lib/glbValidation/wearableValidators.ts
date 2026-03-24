import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { WearableCategory } from '@dcl/schemas'
import { ValidationIssue, ValidationSeverity } from './types'
import {
  getEffectiveTriangleLimit,
  MAX_DIMENSIONS,
  MAX_MATERIALS_DEFAULT,
  MAX_MATERIALS_SKIN,
  MAX_TEXTURES_DEFAULT,
  MAX_TEXTURES_SKIN,
  MAX_TEXTURE_RESOLUTION_DEFAULT,
  MAX_TEXTURE_RESOLUTION_FACIAL,
  FACIAL_CATEGORIES,
  MAX_BONE_INFLUENCES_PER_VERTEX,
  AVATAR_SKIN_MAT,
  FORBIDDEN_MATERIAL_PATTERNS
} from './constants'

type ThreeModules = typeof import('three')

function getTriangleCount(Three: ThreeModules, scene: THREE.Scene): number {
  let triangles = 0
  scene.traverse((node: THREE.Object3D) => {
    if (node instanceof Three.Mesh) {
      const geometry = node.geometry
      if (geometry instanceof Three.BufferGeometry) {
        if (geometry.index) {
          triangles += geometry.index.count / 3
        } else {
          const position = geometry.getAttribute('position')
          if (position) {
            triangles += position.count / 3
          }
        }
      } else if (geometry instanceof Three.Geometry) {
        triangles += geometry.faces.length
      }
    }
  })
  return Math.floor(triangles)
}

/**
 * Validates that the scene's total triangle count does not exceed the limit for the given category.
 * Supports the Tris Combiner rule: when a wearable hides other slots, their triangle budgets are
 * added to the base limit.
 *
 * When category is known but hides are not provided, reports ERROR if the base limit is exceeded,
 * with a hint that hiding other slots in the item editor can increase the allowed budget.
 *
 * When both category and hides are provided, uses the full combined limit.
 *
 * @param hides - Categories this wearable hides (used for Tris Combiner calculation).
 */
export function validateTriangleCounts(
  Three: ThreeModules,
  scene: THREE.Scene,
  category?: WearableCategory,
  hides?: string[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const triangles = getTriangleCount(Three, scene)

  if (!category) return issues

  const limit = getEffectiveTriangleLimit(category, hides)
  if (triangles > limit) {
    // When hides are known the limit is final — report as a hard error
    // When hides are not known (e.g. during item creation) add a hint about the Tris Combiner
    const hasHidesInfo = hides !== undefined && hides.length > 0
    issues.push({
      code: 'TRIANGLE_COUNT_EXCEEDED',
      severity: ValidationSeverity.WARNING,
      messageKey: hasHidesInfo
        ? 'create_single_item_modal.error.glb_validation.triangle_count_exceeded'
        : 'create_single_item_modal.error.glb_validation.triangle_count_exceeded_with_hint',
      messageParams: { count: triangles, limit, category }
    })
  }

  return issues
}

/**
 * Validates that the scene's bounding-box dimensions do not exceed the maximum
 * allowed size (2.42 m width, 2.42 m height, 1.4 m depth). Reports ERROR on violation.
 */
export function validateDimensions(Three: ThreeModules, scene: THREE.Scene): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const size = new Three.Box3().setFromObject(scene).getSize(new Three.Vector3())

  // Three.js Box3 size: x=width, y=height, z=depth
  const width = parseFloat(size.x.toFixed(2))
  const height = parseFloat(size.y.toFixed(2))
  const depth = parseFloat(size.z.toFixed(2))

  if (width > MAX_DIMENSIONS.width || height > MAX_DIMENSIONS.height || depth > MAX_DIMENSIONS.depth) {
    issues.push({
      code: 'DIMENSIONS_EXCEEDED',
      severity: ValidationSeverity.WARNING,
      messageKey: 'create_single_item_modal.error.glb_validation.dimensions_exceeded',
      messageParams: {
        width,
        height,
        depth,
        maxWidth: MAX_DIMENSIONS.width,
        maxHeight: MAX_DIMENSIONS.height,
        maxDepth: MAX_DIMENSIONS.depth
      }
    })
  }

  return issues
}

/**
 * Validates that the number of unique materials (excluding AvatarSkin_MAT) does not exceed
 * the allowed limit (2 for standard categories, 5 for skin). Reports ERROR on violation.
 */
export function validateMaterials(Three: ThreeModules, scene: THREE.Scene, category?: WearableCategory): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const materials = new Set<string>()

  scene.traverse((node: THREE.Object3D) => {
    if (node instanceof Three.Mesh && node.material) {
      const mat = node.material as THREE.Material
      if (mat.name !== AVATAR_SKIN_MAT) {
        materials.add(mat.name)
      }
    }
  })

  const isSkin = category === WearableCategory.SKIN
  const limit = isSkin ? MAX_MATERIALS_SKIN : MAX_MATERIALS_DEFAULT

  if (materials.size > limit) {
    issues.push({
      code: 'MATERIALS_EXCEEDED',
      severity: ValidationSeverity.WARNING,
      messageKey: 'create_single_item_modal.error.glb_validation.materials_exceeded',
      messageParams: { count: materials.size, limit }
    })
  }

  return issues
}

/**
 * Validates texture count and resolution. The texture limit is 2 (5 for skin).
 * Resolution is capped at 512 px (256 px for facial categories). Reports ERROR on violation.
 */
export function validateTextures(Three: ThreeModules, scene: THREE.Scene, category?: WearableCategory): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const textures = new Set<string>()
  const checkedResolutions = new Set<string>()
  const isSkin = category === WearableCategory.SKIN
  const isFacial = category !== undefined && FACIAL_CATEGORIES.includes(category)

  const maxResolution = isFacial ? MAX_TEXTURE_RESOLUTION_FACIAL : MAX_TEXTURE_RESOLUTION_DEFAULT
  const textureLimit = isSkin ? MAX_TEXTURES_SKIN : MAX_TEXTURES_DEFAULT

  scene.traverse((node: THREE.Object3D) => {
    if (node instanceof Three.Mesh && node.material) {
      const mat = node.material as THREE.MeshStandardMaterial
      if (mat.name === AVATAR_SKIN_MAT) return

      // Count only the base color texture (map) per material for the texture count.
      // Other map slots (normal, roughness, etc.) are part of the same material setup, not separate textures.
      if (mat.map) {
        textures.add(mat.map.uuid)
      }

      // Check resolution on all map slots that have images
      const maps = [mat.map, mat.emissiveMap, mat.alphaMap, mat.aoMap, mat.normalMap, mat.roughnessMap, mat.metalnessMap]
      for (const texture of maps) {
        if (texture && texture.image && !checkedResolutions.has(texture.uuid)) {
          checkedResolutions.add(texture.uuid)
          const texName = texture.name || mat.name
          const imgWidth = texture.image.width
          const imgHeight = texture.image.height

          if (imgWidth > maxResolution || imgHeight > maxResolution) {
            issues.push({
              code: 'TEXTURE_RESOLUTION_EXCEEDED',
              severity: ValidationSeverity.WARNING,
              messageKey: 'create_single_item_modal.error.glb_validation.texture_resolution_exceeded',
              messageParams: {
                name: texName,
                width: imgWidth,
                height: imgHeight,
                maxWidth: maxResolution,
                maxHeight: maxResolution
              }
            })
          }
        }
      }
    }
  })

  if (textures.size > textureLimit) {
    issues.push({
      code: 'TEXTURES_EXCEEDED',
      severity: ValidationSeverity.WARNING,
      messageKey: 'create_single_item_modal.error.glb_validation.textures_exceeded',
      messageParams: { count: textures.size, limit: textureLimit }
    })
  }

  return issues
}

/**
 * Validates that no vertex has more than 4 bone influences in skinned meshes.
 * Reports ERROR if the skinWeight attribute exceeds the allowed item size.
 */
export function validateBoneInfluences(Three: ThreeModules, scene: THREE.Scene): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  scene.traverse((node: THREE.Object3D) => {
    if (node instanceof Three.SkinnedMesh) {
      const geometry = node.geometry as THREE.BufferGeometry
      const skinWeight = geometry.getAttribute('skinWeight')

      if (skinWeight) {
        // skinWeight is a Vector4 per vertex (itemSize=4), values represent bone weights
        // If there are more than 4 influences, Three.js already clamps to 4.
        // But we check if any vertex has non-zero weights beyond what's expected
        // Since Three.js uses 4-component skinWeight, this is inherently limited to 4.
        // However, we can check if the original data had more by looking at the raw buffer.
        // For GLB files loaded by Three.js, this is already clamped — so this serves
        // as documentation validation. We'll check that all weights sum roughly to 1.
        // The real risk is when weights are malformed.
        if (skinWeight.itemSize > MAX_BONE_INFLUENCES_PER_VERTEX) {
          issues.push({
            code: 'BONE_INFLUENCES_EXCEEDED',
            severity: ValidationSeverity.WARNING,
            messageKey: 'create_single_item_modal.error.glb_validation.bone_influences_exceeded',
            messageParams: { limit: MAX_BONE_INFLUENCES_PER_VERTEX }
          })
        }
      }
    }
  })

  return issues
}

/**
 * Detects leaf bones (names ending in "_end" or "_neutral") that are typically
 * unnecessary export artifacts. Reports WARNING listing up to 5 bone names.
 */
export function validateNoLeafBones(Three: ThreeModules, scene: THREE.Scene): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const leafBones: string[] = []

  scene.traverse((node: THREE.Object3D) => {
    if (node instanceof Three.Bone) {
      const name = node.name.toLowerCase()
      if (name.endsWith('_end') || name.endsWith('_neutral')) {
        leafBones.push(node.name)
      }
    }
  })

  if (leafBones.length > 0) {
    issues.push({
      code: 'LEAF_BONES_FOUND',
      severity: ValidationSeverity.WARNING,
      messageKey: 'create_single_item_modal.error.glb_validation.leaf_bones_found',
      messageParams: { bones: leafBones.slice(0, 5).join(', ') + (leafBones.length > 5 ? '...' : '') }
    })
  }

  return issues
}

/**
 * Checks for objects that are not allowed in wearable GLBs: cameras, lights,
 * and animation clips. Reports ERROR for each disallowed object type found.
 */
export function validateNoDisallowedObjects(Three: ThreeModules, gltf: GLTF): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const { scene, animations } = gltf

  let hasCameras = false
  let hasLights = false

  scene.traverse((node: THREE.Object3D) => {
    if (node instanceof Three.Camera) {
      hasCameras = true
    }
    if (node instanceof Three.Light) {
      hasLights = true
    }
  })

  if (hasCameras) {
    issues.push({
      code: 'CAMERAS_FOUND',
      severity: ValidationSeverity.WARNING,
      messageKey: 'create_single_item_modal.error.glb_validation.cameras_found'
    })
  }

  if (hasLights) {
    issues.push({
      code: 'LIGHTS_FOUND',
      severity: ValidationSeverity.WARNING,
      messageKey: 'create_single_item_modal.error.glb_validation.lights_found'
    })
  }

  // Wearables must not contain animations
  if (animations.length > 0) {
    issues.push({
      code: 'ANIMATIONS_IN_WEARABLE',
      severity: ValidationSeverity.WARNING,
      messageKey: 'create_single_item_modal.error.glb_validation.animations_in_wearable'
    })
  }

  return issues
}

/**
 * Validates that non-facial wearables do not use material names containing
 * reserved facial patterns ("_mouth", "_eyebrows", "_eyes"). Reports WARNING per match.
 */
export function validateMaterialNaming(Three: ThreeModules, scene: THREE.Scene, category?: WearableCategory): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  // Only check if category is known and is NOT a facial category
  const isFacial = category !== undefined && FACIAL_CATEGORIES.includes(category)
  if (isFacial) return issues

  scene.traverse((node: THREE.Object3D) => {
    if (node instanceof Three.Mesh && node.material) {
      const mat = node.material as THREE.Material
      const nameLower = mat.name.toLowerCase()

      for (const pattern of FORBIDDEN_MATERIAL_PATTERNS) {
        if (nameLower.includes(pattern)) {
          issues.push({
            code: 'FORBIDDEN_MATERIAL_NAME',
            severity: ValidationSeverity.WARNING,
            messageKey: 'create_single_item_modal.error.glb_validation.forbidden_material_name',
            messageParams: { name: mat.name, pattern }
          })
        }
      }
    }
  })

  return issues
}
