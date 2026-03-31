import { BoneNode, SpringBoneParams } from 'modules/editor/types'
import { extractGlbChunks } from 'lib/glbUtils'

export const SPRING_BONE_PREFIX = 'springbone'
export const DCL_SPRING_BONE_EXTENSION = 'DCL_spring_bone_joint'

export const DEFAULT_SPRING_BONE_PARAMS: SpringBoneParams = {
  stiffness: 1,
  gravityPower: 0,
  gravityDir: [0, -1, 0],
  drag: 0.4,
  center: undefined
}

export type SpringBonesParseResult = {
  bones: BoneNode[]
}

type GltfExtension = {
  version?: number
  stiffness?: number
  gravityPower?: number
  gravityDir?: [number, number, number]
  drag?: number
  hitRadius?: number
  isRoot?: boolean
  center?: string
}

type GltfNode = {
  name?: string
  extensions?: Record<string, unknown>
  children?: number[]
}

function formatNumber(value: number | string): number {
  return Number(Number(value).toFixed(3))
}

function parseParams(ext: GltfExtension): SpringBoneParams {
  const stiffness = typeof ext.stiffness === 'number' ? formatNumber(ext.stiffness) : DEFAULT_SPRING_BONE_PARAMS.stiffness
  const gravityPower = typeof ext.gravityPower === 'number' ? formatNumber(ext.gravityPower) : DEFAULT_SPRING_BONE_PARAMS.gravityPower
  const drag = typeof ext.drag === 'number' ? formatNumber(ext.drag) : DEFAULT_SPRING_BONE_PARAMS.drag
  const center = typeof ext.center === 'string' ? ext.center : DEFAULT_SPRING_BONE_PARAMS.center

  let gravityDir: [number, number, number] = DEFAULT_SPRING_BONE_PARAMS.gravityDir
  if (Array.isArray(ext.gravityDir) && ext.gravityDir.length === 3) {
    const [x, y, z] = ext.gravityDir
    if (typeof x === 'number' && typeof y === 'number' && typeof z === 'number') {
      gravityDir = [formatNumber(x), formatNumber(y), formatNumber(z)]
    }
  }

  return { stiffness, gravityPower, gravityDir, drag, center }
}

const isSpringBoneNode = (node: GltfNode): boolean => {
  return !!node.name && node.name.toLowerCase().includes(SPRING_BONE_PREFIX)
}

function getSpringBoneExtension(node: GltfNode): GltfExtension | null {
  const extension = node.extensions?.[DCL_SPRING_BONE_EXTENSION]
  return extension && typeof extension === 'object' ? (extension as GltfExtension) : null
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
      const bone: BoneNode = { name, nodeId: i, type: 'spring', children }

      const extension = getSpringBoneExtension(node)
      if (extension) {
        const params = parseParams(extension)

        // Validate center: must not point to a spring bone node
        if (typeof params.center === 'string' && params.center.toLowerCase().includes(SPRING_BONE_PREFIX)) {
          params.center = undefined
        }

        bone.params = params
      }

      bones.push(bone)
    } else {
      bones.push({ name, nodeId: i, type: 'avatar', children })
    }
  }

  return { bones }
}
