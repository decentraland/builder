import { BoneNode, SpringBoneParams } from 'modules/editor/types'
import { extractGlbChunks, GLB_MAGIC, JSON_CHUNK_TYPE, GLB_HEADER_SIZE, CHUNK_HEADER_SIZE, JSON_CHUNK_DATA_OFFSET } from 'lib/glbUtils'

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

  // Pad to 4-byte alignment with 0x20 (space)
  const paddedLength = Math.ceil(newJsonBytes.length / 4) * 4
  const paddedJsonBytes = new Uint8Array(paddedLength)
  paddedJsonBytes.fill(0x20) // fill with spaces
  paddedJsonBytes.set(newJsonBytes)

  // Find BIN chunk start
  const binChunkOffset = GLB_HEADER_SIZE + CHUNK_HEADER_SIZE + chunks.jsonChunkLength
  const hasBinChunk = buffer.byteLength > binChunkOffset

  // Compute new total length
  const newTotalLength = GLB_HEADER_SIZE + CHUNK_HEADER_SIZE + paddedLength + (hasBinChunk ? buffer.byteLength - binChunkOffset : 0)

  const output = new ArrayBuffer(newTotalLength)
  const outView = new DataView(output)
  const outBytes = new Uint8Array(output)

  // Write GLB header (12 bytes): magic, version, totalLength
  outView.setUint32(0, GLB_MAGIC, true)
  outView.setUint32(4, chunks.version, true)
  outView.setUint32(8, newTotalLength, true)

  // Write JSON chunk header (8 bytes): chunkLength, chunkType
  outView.setUint32(GLB_HEADER_SIZE, paddedLength, true)
  outView.setUint32(GLB_HEADER_SIZE + 4, JSON_CHUNK_TYPE, true)

  // Write new JSON chunk bytes
  outBytes.set(paddedJsonBytes, JSON_CHUNK_DATA_OFFSET)

  // Copy BIN chunk verbatim
  if (hasBinChunk) {
    const binChunk = new Uint8Array(buffer, binChunkOffset)
    outBytes.set(binChunk, JSON_CHUNK_DATA_OFFSET + paddedLength)
  }

  return output
}
