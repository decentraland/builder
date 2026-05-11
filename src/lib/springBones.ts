import { SpringBoneParams, SpringBonesData } from '@dcl/schemas'
import { Item, ItemType, WearableRepresentation } from 'modules/item/types'
import { BoneNode, SpringBoneNode } from 'modules/editor/types'
import { getRepresentationsModelHashes } from 'modules/item/utils'
import { MAX_SPRING_BONES } from 'lib/glbValidation/constants'
import { parseSpringBones } from 'lib/parseSpringBones'

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

/** Recursively counts the number of bones in the subtree rooted at the given node. */
export function countSubtreeSize(boneMap: Map<number, BoneNode>, nodeId: number): number {
  const bone = boneMap.get(nodeId)
  if (!bone) return 0
  let count = 1
  for (const childId of bone.children) {
    count += countSubtreeSize(boneMap, childId)
  }
  return count
}

/** Builds a map of spring bone name to subtree size (root + descendants). */
export function buildSubtreeSizes(bones: BoneNode[]): Map<string, number> {
  const boneMap = new Map<number, BoneNode>(bones.map(b => [b.nodeId, b]))
  const springBones = bones.filter((b): b is SpringBoneNode => b.type === 'spring')
  return new Map(springBones.map(b => [b.name, countSubtreeSize(boneMap, b.nodeId)]))
}

/** Sums subtree sizes for the configured spring bones to estimate total bones affected by simulation. */
export function sumConfiguredBones(subtreeSizes: Map<string, number>, params: Record<string, SpringBoneParams>): number {
  let total = 0
  for (const name of Object.keys(params)) {
    total += subtreeSizes.get(name) ?? 1
  }
  return total
}

/**
 * Returns default SpringBoneParams keyed by bone name for each chain root in the given bones.
 * A "chain root" is a spring bone whose direct parent is not also a spring bone. Roots are admitted
 * greedily in GLB-node order while the cumulative subtree size stays ≤ MAX_SPRING_BONES, matching
 * the cap that the right panel and validator enforce.
 */
export function getDefaultSpringBoneRoots(bones: BoneNode[]): Record<string, SpringBoneParams> {
  const parentByNodeId = new Map<number, number>()
  const boneByNodeId = new Map<number, BoneNode>()
  const springNodeIds = new Set<number>()
  const roots: Record<string, SpringBoneParams> = {}
  let runningSubtreeSum = 0

  // Single pass to build lookup maps for parent, bone, and spring bones by node ID
  for (const bone of bones) {
    boneByNodeId.set(bone.nodeId, bone)
    if (bone.type === 'spring') springNodeIds.add(bone.nodeId)
    for (const childId of bone.children) {
      parentByNodeId.set(childId, bone.nodeId)
    }
  }

  // Greedy admit chain roots in GLB-node order while cumulative subtree size stays ≤ MAX_SPRING_BONES.
  // A spring bone with no parent (top-level node) is also a chain root. A root whose subtree alone
  // would push the running total over the cap is skipped, but later smaller roots may still fit.
  for (const nodeId of springNodeIds.values()) {
    const parentId = parentByNodeId.get(nodeId)
    const bone = boneByNodeId.get(nodeId)
    if (!bone) continue
    if (parentId !== undefined && springNodeIds.has(parentId)) continue
    const subtreeSize = countSubtreeSize(boneByNodeId, nodeId)
    if (runningSubtreeSum + subtreeSize > MAX_SPRING_BONES) continue
    roots[bone.name] = getDefaultSpringBoneParams()
    runningSubtreeSum += subtreeSize
  }

  return roots
}

/**
 * Builds a SpringBonesData object seeded with default params for chain roots in each
 * representation's main GLB. Returns undefined when no representation yields any roots.
 */
export async function seedSpringBonesForUpload(
  representations: WearableRepresentation[],
  blobsByPath: Record<string, Blob>,
  hashesByPath: Record<string, string>
): Promise<SpringBonesData | undefined> {
  const models: Record<string, Record<string, SpringBoneParams>> = {}

  for (const representation of representations) {
    const blob = blobsByPath[representation.mainFile]
    const hash = hashesByPath[representation.mainFile]
    if (!blob || !hash || hash in models) continue

    try {
      const buffer = await blob.arrayBuffer()
      const { bones } = parseSpringBones(buffer)
      const roots = getDefaultSpringBoneRoots(bones)
      if (Object.keys(roots).length > 0) {
        models[hash] = roots
      }
    } catch (error) {
      console.warn(`Failed to seed spring bones for ${representation.mainFile}:`, error)
    }
  }

  return Object.keys(models).length > 0 ? { version: SPRING_BONES_VERSION, models } : undefined
}

/**
 * Builds a SpringBonesData object for an item being updated (GLB replaced or new representation added).
 * Seeds defaults for chain roots in the new GLB(s) while preserving the pristine item's already-tuned
 * entries for hashes that survive the update. Hashes no longer reachable through any representation drop out.
 */
export async function seedSpringBonesForUpdate(
  originalItem: Item,
  updatedItem: Item,
  representations: WearableRepresentation[],
  blobsByPath: Record<string, Blob>,
  hashesByPath: Record<string, string>
): Promise<SpringBonesData | undefined> {
  const seeded = await seedSpringBonesForUpload(representations, blobsByPath, hashesByPath)
  const existing = originalItem.type === ItemType.WEARABLE ? originalItem.data.springBones?.models ?? {} : {}
  const reachable = getRepresentationsModelHashes(updatedItem)

  const merged: SpringBonesData['models'] = {}
  for (const [hash, params] of Object.entries({ ...(seeded?.models ?? {}), ...existing })) {
    if (reachable.has(hash) && Object.keys(params).length > 0) {
      merged[hash] = params
    }
  }

  return Object.keys(merged).length > 0 ? { version: SPRING_BONES_VERSION, models: merged } : undefined
}
