import { BoneNode, SpringBoneParams } from 'modules/editor/types'
import { SpringBoneNode } from './SpringBonesSection'

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

/** Builds a map of bone name to subtree size for all bones that have spring bone params configured. */
export function buildSubtreeSizes(bones: BoneNode[]): Map<string, number> {
  const boneMap = new Map<number, BoneNode>(bones.map(b => [b.nodeId, b]))
  const springBones = bones.filter((b): b is SpringBoneNode => b.type === 'spring')
  return new Map(springBones.map(b => [b.name, countSubtreeSize(boneMap, b.nodeId)]))
}

/** Sums the sizes of the subtrees for all bones that have spring bone params configured,
 * to give an estimate of how many bones are affected by the spring bone simulation. */
export function sumConfiguredBones(subtreeSizes: Map<string, number>, params: Record<string, SpringBoneParams>): number {
  let total = 0
  for (const name of Object.keys(params)) {
    total += subtreeSizes.get(name) ?? 1
  }
  return total
}
