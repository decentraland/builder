import type { AnimationClip, Scene } from 'three'
import { ValidationIssue, ValidationSeverity } from './types'
import {
  EMOTE_EXPECTED_FPS,
  EMOTE_FPS_TOLERANCE,
  EMOTE_MAX_FRAMES,
  EMOTE_MAX_ANIMATION_CLIPS_BASIC,
  EMOTE_MAX_ANIMATION_CLIPS_WITH_PROPS,
  EMOTE_MAX_DISPLACEMENT_METERS,
  PROP_MAX_TRIANGLES,
  PROP_MAX_MATERIALS,
  PROP_MAX_TEXTURES,
  PROP_MAX_ARMATURE_BONES,
  AVATAR_ARMATURE_NAME,
  PROP_ARMATURE_NAME,
  VALID_AUDIO_EXTENSIONS
} from './constants'

type ThreeModules = typeof import('three')

export function validateEmoteFrameRate(animations: AnimationClip[]): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  if (animations.length === 0) return issues

  const animation = animations[0]
  let maxFrames = 0
  for (const track of animation.tracks) {
    maxFrames = Math.max(maxFrames, track.times.length)
  }

  if (animation.duration > 0) {
    const fps = Math.round(maxFrames / animation.duration)
    if (Math.abs(fps - EMOTE_EXPECTED_FPS) > EMOTE_FPS_TOLERANCE) {
      issues.push({
        code: 'EMOTE_FRAME_RATE',
        severity: ValidationSeverity.WARNING,
        messageKey: 'create_single_item_modal.error.glb_validation.emote_frame_rate',
        messageParams: { fps, expected: EMOTE_EXPECTED_FPS }
      })
    }
  }

  return issues
}

export function validateEmoteMaxFrames(animations: AnimationClip[]): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  if (animations.length === 0) return issues

  const animation = animations[0]
  let maxFrames = 0
  for (const track of animation.tracks) {
    maxFrames = Math.max(maxFrames, track.times.length)
  }

  if (maxFrames > EMOTE_MAX_FRAMES) {
    issues.push({
      code: 'EMOTE_MAX_FRAMES',
      severity: ValidationSeverity.ERROR,
      messageKey: 'create_single_item_modal.error.glb_validation.emote_max_frames',
      messageParams: { frames: maxFrames, limit: EMOTE_MAX_FRAMES }
    })
  }

  return issues
}

export function validateEmoteAnimationClipCount(animations: AnimationClip[], hasProps: boolean): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const limit = hasProps ? EMOTE_MAX_ANIMATION_CLIPS_WITH_PROPS : EMOTE_MAX_ANIMATION_CLIPS_BASIC

  if (animations.length > limit) {
    issues.push({
      code: 'EMOTE_MAX_CLIPS',
      severity: ValidationSeverity.ERROR,
      messageKey: 'create_single_item_modal.error.glb_validation.emote_max_clips',
      messageParams: { count: animations.length, limit }
    })
  }

  return issues
}

export function validateEmoteDeformBoneKeyframes(
  Three: ThreeModules,
  scene: Scene,
  animations: AnimationClip[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  if (animations.length === 0) return issues

  // Collect deform bone names from the scene
  const deformBoneNames = new Set<string>()
  scene.traverse((node: THREE.Object3D) => {
    if (node instanceof Three.Bone) {
      deformBoneNames.add(node.name)
    }
  })

  if (deformBoneNames.size === 0) return issues

  const animation = animations[0]

  // Group tracks by bone name. Track names follow pattern: "boneName.property"
  const boneTrackMap = new Map<string, Set<string>>()
  for (const track of animation.tracks) {
    const dotIndex = track.name.lastIndexOf('.')
    if (dotIndex === -1) continue
    const boneName = track.name.substring(0, dotIndex)
    const property = track.name.substring(dotIndex + 1)

    // Only check standard transform properties
    if (!['position', 'quaternion', 'scale'].includes(property)) continue

    if (!boneTrackMap.has(boneName)) {
      boneTrackMap.set(boneName, new Set())
    }
    boneTrackMap.get(boneName)!.add(property)
  }

  // Check each deform bone has keyframes for position, quaternion, scale
  const requiredProperties = ['position', 'quaternion', 'scale']
  const missingBones: string[] = []

  for (const boneName of deformBoneNames) {
    const tracks = boneTrackMap.get(boneName)
    if (!tracks) {
      missingBones.push(boneName)
      continue
    }

    for (const prop of requiredProperties) {
      if (!tracks.has(prop)) {
        missingBones.push(`${boneName}.${prop}`)
        break
      }
    }
  }

  if (missingBones.length > 0) {
    issues.push({
      code: 'EMOTE_MISSING_KEYFRAMES',
      severity: ValidationSeverity.WARNING,
      messageKey: 'create_single_item_modal.error.glb_validation.emote_missing_keyframes',
      messageParams: {
        bones: missingBones.slice(0, 5).join(', ') + (missingBones.length > 5 ? ` (+${missingBones.length - 5} more)` : '')
      }
    })
  }

  return issues
}

export function validateEmoteDisplacement(animations: AnimationClip[]): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  if (animations.length === 0) return issues

  const animation = animations[0]

  // Find the root position track (Hips or the first position track)
  for (const track of animation.tracks) {
    if (track.name.endsWith('.position') && (track.name.includes('Hips') || track.name.includes('Hip'))) {
      const values = track.values
      if (values.length < 3) continue

      // Initial position (first keyframe)
      const startX = values[0]
      const startY = values[1]
      const startZ = values[2]

      // Check max displacement across all keyframes
      let maxDisplacement = 0
      for (let i = 0; i < values.length; i += 3) {
        const dx = values[i] - startX
        const dy = values[i + 1] - startY
        const dz = values[i + 2] - startZ
        const displacement = Math.sqrt(dx * dx + dy * dy + dz * dz)
        maxDisplacement = Math.max(maxDisplacement, displacement)
      }

      if (maxDisplacement > EMOTE_MAX_DISPLACEMENT_METERS) {
        issues.push({
          code: 'EMOTE_DISPLACEMENT',
          severity: ValidationSeverity.ERROR,
          messageKey: 'create_single_item_modal.error.glb_validation.emote_displacement',
          messageParams: {
            distance: parseFloat(maxDisplacement.toFixed(2)),
            limit: EMOTE_MAX_DISPLACEMENT_METERS
          }
        })
      }

      break // Only check the root bone
    }
  }

  return issues
}

export function validatePropTriangles(Three: ThreeModules, scene: Scene): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  let propTriangles = 0

  // Find the Armature_Prop node and count triangles under it
  const propArmature = scene.children.find(child => child.name === PROP_ARMATURE_NAME)
  if (!propArmature) return issues

  propArmature.traverse((node: THREE.Object3D) => {
    if (node instanceof Three.Mesh) {
      const geometry = node.geometry
      if (geometry instanceof Three.BufferGeometry) {
        if (geometry.index) {
          propTriangles += geometry.index.count / 3
        } else {
          const position = geometry.getAttribute('position')
          if (position) {
            propTriangles += position.count / 3
          }
        }
      } else if (geometry instanceof Three.Geometry) {
        propTriangles += geometry.faces.length
      }
    }
  })

  propTriangles = Math.floor(propTriangles)

  if (propTriangles > PROP_MAX_TRIANGLES) {
    issues.push({
      code: 'PROP_TRIANGLE_COUNT',
      severity: ValidationSeverity.ERROR,
      messageKey: 'create_single_item_modal.error.glb_validation.prop_triangle_count',
      messageParams: { count: propTriangles, limit: PROP_MAX_TRIANGLES }
    })
  }

  return issues
}

export function validatePropMaterials(Three: ThreeModules, scene: Scene): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const materials = new Set<string>()

  const propArmature = scene.children.find(child => child.name === PROP_ARMATURE_NAME)
  if (!propArmature) return issues

  propArmature.traverse((node: THREE.Object3D) => {
    if (node instanceof Three.Mesh && node.material) {
      materials.add((node.material as THREE.Material).name)
    }
  })

  if (materials.size > PROP_MAX_MATERIALS) {
    issues.push({
      code: 'PROP_MATERIALS',
      severity: ValidationSeverity.ERROR,
      messageKey: 'create_single_item_modal.error.glb_validation.prop_materials',
      messageParams: { count: materials.size, limit: PROP_MAX_MATERIALS }
    })
  }

  return issues
}

export function validatePropTextures(Three: ThreeModules, scene: Scene): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const textures = new Set<string>()

  const propArmature = scene.children.find(child => child.name === PROP_ARMATURE_NAME)
  if (!propArmature) return issues

  propArmature.traverse((node: THREE.Object3D) => {
    if (node instanceof Three.Mesh && node.material) {
      const mat = node.material as THREE.MeshStandardMaterial
      const maps = [mat.map, mat.emissiveMap, mat.alphaMap, mat.aoMap, mat.normalMap, mat.roughnessMap, mat.metalnessMap]
      for (const texture of maps) {
        if (texture) {
          textures.add(texture.uuid)
        }
      }
    }
  })

  if (textures.size > PROP_MAX_TEXTURES) {
    issues.push({
      code: 'PROP_TEXTURES',
      severity: ValidationSeverity.ERROR,
      messageKey: 'create_single_item_modal.error.glb_validation.prop_textures',
      messageParams: { count: textures.size, limit: PROP_MAX_TEXTURES }
    })
  }

  return issues
}

export function validatePropArmatureBones(Three: ThreeModules, scene: Scene): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  let boneCount = 0

  const propArmature = scene.children.find(child => child.name === PROP_ARMATURE_NAME)
  if (!propArmature) return issues

  propArmature.traverse((node: THREE.Object3D) => {
    if (node instanceof Three.Bone) {
      boneCount++
    }
  })

  if (boneCount > PROP_MAX_ARMATURE_BONES) {
    issues.push({
      code: 'PROP_ARMATURE_BONES',
      severity: ValidationSeverity.ERROR,
      messageKey: 'create_single_item_modal.error.glb_validation.prop_armature_bones',
      messageParams: { count: boneCount, limit: PROP_MAX_ARMATURE_BONES }
    })
  }

  return issues
}

export function validateArmatureNaming(scene: Scene): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const armatureNames: string[] = []

  for (const child of scene.children) {
    if (child.name.startsWith('Armature')) {
      armatureNames.push(child.name)
    }
  }

  if (armatureNames.length === 0) return issues

  const validNames = [AVATAR_ARMATURE_NAME, PROP_ARMATURE_NAME]
  const invalidNames = armatureNames.filter(name => !validNames.includes(name) && name !== 'Armature_Other')

  if (invalidNames.length > 0) {
    issues.push({
      code: 'ARMATURE_NAMING',
      severity: ValidationSeverity.WARNING,
      messageKey: 'create_single_item_modal.error.glb_validation.armature_naming',
      messageParams: { names: invalidNames.join(', ') }
    })
  }

  return issues
}

export function validateAnimationNaming(animations: AnimationClip[], hasProps: boolean): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  if (!hasProps || animations.length < 2) return issues

  const invalidNames: string[] = []

  for (const anim of animations) {
    const name = anim.name
    if (!name.endsWith('_Avatar') && !name.endsWith('_Prop')) {
      invalidNames.push(name)
    }
  }

  if (invalidNames.length > 0) {
    issues.push({
      code: 'ANIMATION_NAMING',
      severity: ValidationSeverity.WARNING,
      messageKey: 'create_single_item_modal.error.glb_validation.animation_naming',
      messageParams: { names: invalidNames.join(', ') }
    })
  }

  return issues
}

export function validateAudioFormat(contents: Record<string, Blob>): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  for (const key of Object.keys(contents)) {
    const lowerKey = key.toLowerCase()
    const isAudio = lowerKey.endsWith('.mp3') || lowerKey.endsWith('.ogg') || lowerKey.endsWith('.wav') || lowerKey.endsWith('.aac')

    if (isAudio) {
      const hasValidExt = VALID_AUDIO_EXTENSIONS.some(ext => lowerKey.endsWith(ext))
      if (!hasValidExt) {
        issues.push({
          code: 'AUDIO_FORMAT',
          severity: ValidationSeverity.ERROR,
          messageKey: 'create_single_item_modal.error.glb_validation.audio_format',
          messageParams: { name: key }
        })
      }
    }
  }

  return issues
}
