import { SpringBoneParams } from '@dcl/schemas'

/** Name prefix used to identify spring bone nodes (case-insensitive). */
export const SPRING_BONE_PREFIX = 'springbone'

/** Current version of the spring bones metadata schema written into item.data.springBones. */
export const SPRING_BONES_VERSION = 1

/** Default values for spring bone parameters. DO NOT export this object directly, use getDefaultSpringBoneParams instead. */
const DEFAULT_SPRING_BONE_PARAMS: SpringBoneParams = {
  stiffness: 2,
  gravityPower: 0,
  gravityDir: [0, -1, 0],
  drag: 0.5,
  center: undefined,
  isRoot: true
}

/** Returns a new SpringBoneParams object with default values. */
export function getDefaultSpringBoneParams(): SpringBoneParams {
  return { ...DEFAULT_SPRING_BONE_PARAMS, gravityDir: [...DEFAULT_SPRING_BONE_PARAMS.gravityDir] }
}

/** Returns true if the node name identifies a spring bone (case-insensitive). */
export function isSpringBoneName(name: string): boolean {
  return name.toLowerCase().includes(SPRING_BONE_PREFIX)
}
