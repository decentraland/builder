import { BoneNode, SpringBoneParams } from 'modules/editor/types'
import { extractGlbChunks } from 'lib/glbUtils'

const SPRING_BONE_PARAM_KEYS = ['stiffness', 'gravityPower', 'gravityDir', 'dragForce', 'center'] as const

export const SPRING_BONE_PREFIX = 'springbone'

export const DEFAULT_SPRING_BONE_PARAMS: SpringBoneParams = {
  stiffness: 1,
  gravityPower: 0,
  gravityDir: [0, -1, 0],
  dragForce: 0.4,
  center: undefined
}

export type SpringBonesParseResult = {
  bones: BoneNode[]
}

type GltfNode = {
  name?: string
  extras?: Record<string, unknown>
  children?: number[]
}

function hasSpringBoneExtras(extras: Record<string, unknown>): boolean {
  return SPRING_BONE_PARAM_KEYS.some(key => key in extras)
}

function formatNumber(value: number | string): number {
  return Number(Number(value).toFixed(3))
}

function parseParams(extras: Record<string, unknown>): SpringBoneParams {
  const stiffness = typeof extras.stiffness === 'number' ? formatNumber(extras.stiffness) : DEFAULT_SPRING_BONE_PARAMS.stiffness
  const gravityPower = typeof extras.gravityPower === 'number' ? formatNumber(extras.gravityPower) : DEFAULT_SPRING_BONE_PARAMS.gravityPower
  const dragForce = typeof extras.dragForce === 'number' ? formatNumber(extras.dragForce) : DEFAULT_SPRING_BONE_PARAMS.dragForce
  const center = typeof extras.center === 'number' ? formatNumber(extras.center) : DEFAULT_SPRING_BONE_PARAMS.center

  let gravityDir: [number, number, number] = DEFAULT_SPRING_BONE_PARAMS.gravityDir
  if (Array.isArray(extras.gravityDir) && extras.gravityDir.length === 3) {
    const [x, y, z] = extras.gravityDir
    if (typeof x === 'number' && typeof y === 'number' && typeof z === 'number') {
      gravityDir = [formatNumber(x), formatNumber(y), formatNumber(z)]
    }
  }

  return { stiffness, gravityPower, gravityDir, dragForce, center }
}

const isSpringBoneNode = (node: GltfNode): boolean => {
  return !!node.name && node.name.toLowerCase().includes(SPRING_BONE_PREFIX)
}

export function parseSpringBones(buffer: ArrayBuffer): SpringBonesParseResult {
  console.log('[SpringBones:parse] Starting parseSpringBones, buffer size:', buffer.byteLength)
  const chunks = extractGlbChunks(buffer)
  if (!chunks) {
    console.warn('[SpringBones:parse] No JSON chunk found in GLB')
    return { bones: [] }
  }
  const gltf = chunks.json as { nodes?: GltfNode[] }
  if (!gltf.nodes) {
    console.warn('[SpringBones:parse] No nodes found in GLB')
    return { bones: [] }
  }
  console.log('[SpringBones:parse] Found', gltf.nodes.length, 'total glTF nodes')

  // Build nodeId -> name map for center resolution (avatar bones only)
  const nodes = gltf.nodes
  const nodeIdToName = new Map<number, string>()
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (!isSpringBoneNode(node)) {
      nodeIdToName.set(i, node.name ?? `node_${i}`)
    }
  }

  // Single pass: build unified bones array
  const bones: BoneNode[] = []
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const name = node.name ?? `node_${i}`
    const children = node.children ?? []

    if (isSpringBoneNode(node)) {
      const bone: BoneNode = { name, nodeId: i, type: 'spring', children }
      console.log(`[SpringBones:parse] Processing spring bone node:`, { node })

      if (node.extras && hasSpringBoneExtras(node.extras)) {
        const params = parseParams(node.extras)

        // Resolve center node index -> name
        if (typeof params.center === 'number') {
          const centerName = nodeIdToName.get(params.center)
          if (centerName === undefined) {
            // Center index doesn't resolve to an avatar bone — drop it
            params.center = undefined
          }
        }
        bone.params = params
      }

      bones.push(bone)
    } else {
      bones.push({ name, nodeId: i, type: 'avatar', children })
    }
  }

  console.log('[SpringBones:parse] Result:', {
    totalBones: bones.length,
    springBones: bones.filter(b => b.type === 'spring').map(b => ({ name: b.name, nodeId: b.nodeId, params: b.params })),
    avatarBoneCount: bones.filter(b => b.type === 'avatar').length
  })
  return { bones }
}
