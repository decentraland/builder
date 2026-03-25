import { BoneNode, SpringBoneParams } from 'modules/editor/types'
import { extractGlbChunks, buildGlb, GLB_HEADER_SIZE, CHUNK_HEADER_SIZE } from 'lib/glbUtils'

/**
 * Patches spring bone `extras` fields in a GLB binary.
 * Only modifies the JSON chunk; BIN chunk is copied verbatim.
 * Returns a new ArrayBuffer (does not mutate input).
 */
export function patchGltfSpringBones(buffer: ArrayBuffer, bones: BoneNode[], params: Record<string, SpringBoneParams>): ArrayBuffer {
  const springBones = bones.filter(b => b.type === 'spring')

  const chunks = extractGlbChunks(buffer)
  if (!chunks) return buffer

  const json = chunks.json as { nodes?: Array<{ name?: string; extras?: Record<string, unknown> }> }
  if (!json.nodes) return buffer

  // Apply params to spring bone nodes
  for (const sbNode of springBones) {
    const nodeId = sbNode.nodeId
    if (nodeId < 0 || nodeId >= json.nodes.length) {
      console.warn(`[patchGltfSpringBones] nodeId ${nodeId} out of range`)
      continue
    }

    const nodeName = sbNode.name
    const updatedParams = params[nodeName]
    if (!updatedParams) continue

    const node = json.nodes[nodeId]
    if (!node.extras) node.extras = {}

    node.extras.stiffness = updatedParams.stiffness
    node.extras.gravityPower = updatedParams.gravityPower
    node.extras.gravityDir = updatedParams.gravityDir
    node.extras.dragForce = updatedParams.dragForce

    // Resolve center: params.center is already a nodeId (or undefined)
    if (updatedParams.center !== undefined) {
      node.extras.center = updatedParams.center
    } else {
      delete node.extras.center
    }
  }

  // Re-serialize JSON
  const newJsonString = JSON.stringify(json)
  const encoder = new TextEncoder()
  const newJsonBytes = encoder.encode(newJsonString)

  // For .gltf (plain JSON), just return the re-serialized JSON
  if (!chunks.isGlb) {
    return newJsonBytes.buffer
  }

  // For .glb, re-pack the binary container
  const binChunkOffset = GLB_HEADER_SIZE + CHUNK_HEADER_SIZE + chunks.jsonChunkLength
  const hasBinChunk = buffer.byteLength > binChunkOffset
  const trailingData = hasBinChunk ? new Uint8Array(buffer, binChunkOffset) : undefined

  return buildGlb(chunks.json, chunks.version, trailingData)
}
