import { BoneNode, SpringBoneParams } from 'modules/editor/types'
import { extractGlbChunks } from 'lib/glbUtils'
import { SPRING_BONE_PREFIX, isSpringBoneName } from 'lib/springBones'

export { SPRING_BONE_PREFIX }

export const DEFAULT_SPRING_BONE_PARAMS: SpringBoneParams = {
  stiffness: 2,
  gravityPower: 0,
  gravityDir: [0, -1, 0],
  drag: 0.5,
  center: undefined,
  isRoot: true
}

export type SpringBonesParseResult = {
  bones: BoneNode[]
}

type GltfNode = {
  name?: string
  children?: number[]
}

export function getDefaultSpringBoneParams(): SpringBoneParams {
  return { ...DEFAULT_SPRING_BONE_PARAMS, gravityDir: [...DEFAULT_SPRING_BONE_PARAMS.gravityDir] }
}

const isSpringBoneNode = (node: GltfNode): boolean => {
  return !!node.name && isSpringBoneName(node.name)
}

export function parseSpringBones(buffer: ArrayBuffer): SpringBonesParseResult {
  const chunks = extractGlbChunks(buffer)
  if (!chunks?.json?.nodes) {
    return { bones: [] }
  }

  const bones: BoneNode[] = []
  const nodes = chunks.json.nodes as GltfNode[]

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const name = node.name ?? `node_${i}`
    const children = node.children ?? []
    bones.push({ name, nodeId: i, type: isSpringBoneNode(node) ? 'spring' : 'avatar', children })
  }

  return { bones }
}
