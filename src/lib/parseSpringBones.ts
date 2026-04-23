import { BoneNode, SpringBoneParams } from 'modules/editor/types'
import { extractGlbChunks } from 'lib/glbUtils'
import { SPRING_BONE_PREFIX, DCL_SPRING_BONE_EXTENSION, isSpringBoneName } from 'lib/springBones'

export { SPRING_BONE_PREFIX, DCL_SPRING_BONE_EXTENSION }

export const DEFAULT_SPRING_BONE_PARAMS: SpringBoneParams = {
  stiffness: 2,
  gravityPower: 0,
  gravityDir: [0, -1, 0],
  drag: 0.5,
  center: undefined
}

export type SpringBonesParseResult = {
  bones: BoneNode[]
}

type GltfNode = {
  name?: string
  extensions?: Record<string, unknown>
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
  if (!chunks) {
    return { bones: [] }
  }
  const gltf = chunks.json as { nodes?: GltfNode[]; extensionsUsed?: string[] }
  if (!gltf.nodes) {
    return { bones: [] }
  }

  const nodes = gltf.nodes

  // Single pass: build unified bones array
  const bones: BoneNode[] = []
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const name = node.name ?? `node_${i}`
    const children = node.children ?? []

    if (isSpringBoneNode(node)) {
      const bone: BoneNode = {
        name, nodeId: i, type: 'spring', children,
        params: getDefaultSpringBoneParams()
      }
      bones.push(bone)
    } else {
      bones.push({ name, nodeId: i, type: 'avatar', children })
    }
  }

  return { bones }
}
