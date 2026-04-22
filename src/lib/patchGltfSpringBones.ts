import { BoneNode, SpringBoneParams } from 'modules/editor/types'
import { extractGlbChunks, buildGlb, GLB_HEADER_SIZE, CHUNK_HEADER_SIZE } from 'lib/glbUtils'
import { DCL_SPRING_BONE_EXTENSION } from 'lib/parseSpringBones'

type GltfNodeWithExtensions = {
  name?: string
  extras?: Record<string, unknown>
  extensions?: Record<string, unknown>
}

/**
 * Patches spring bone parameters into the `DCL_spring_bone_joint` extension
 * of each spring bone node in a GLB binary.
 * Only modifies the JSON chunk; BIN chunk is copied verbatim.
 * Returns a new ArrayBuffer (does not mutate input).
 */
export function patchGltfSpringBones(buffer: ArrayBuffer, bones: BoneNode[], params: Record<string, SpringBoneParams>): ArrayBuffer {
  const springBones = bones.filter(b => b.type === 'spring')

  const chunks = extractGlbChunks(buffer)
  if (!chunks) return buffer

  const json = chunks.json as { nodes?: GltfNodeWithExtensions[]; extensionsUsed?: string[] }
  if (!json.nodes) return buffer

  // Ensure extensionsUsed includes our extension
  if (!json.extensionsUsed) {
    json.extensionsUsed = []
  }
  if (!json.extensionsUsed.includes(DCL_SPRING_BONE_EXTENSION)) {
    json.extensionsUsed.push(DCL_SPRING_BONE_EXTENSION)
  }

  // Apply params to spring bone nodes
  for (const sbNode of springBones) {
    const nodeId = sbNode.nodeId
    if (nodeId < 0 || nodeId >= json.nodes.length) {
      console.warn(`[patchGltfSpringBones] nodeId ${nodeId} out of range`)
      continue
    }

    const nodeName = sbNode.name
    const updatedParams = params[nodeName]
    const node = json.nodes[nodeId]

    if (!updatedParams) {
      // Remove extension data if params were deleted
      if (node.extensions) {
        delete node.extensions[DCL_SPRING_BONE_EXTENSION]
      }
      continue
    }

    // Build the extension object
    if (!node.extensions) node.extensions = {}
    const extension: Record<string, unknown> = {
      version: 1,
      stiffness: updatedParams.stiffness,
      gravityPower: updatedParams.gravityPower,
      gravityDir: updatedParams.gravityDir,
      drag: updatedParams.drag,
      isRoot: true
    }

    if (updatedParams.center !== undefined) {
      extension.center = updatedParams.center
    }

    node.extensions[DCL_SPRING_BONE_EXTENSION] = extension
  }

  // For .gltf (plain JSON), just return the re-serialized JSON
  if (!chunks.isGlb) {
    const encoder = new TextEncoder()
    return encoder.encode(JSON.stringify(json)).buffer
  }

  // For .glb, re-pack the binary container
  const binChunkOffset = GLB_HEADER_SIZE + CHUNK_HEADER_SIZE + chunks.jsonChunkLength
  const hasBinChunk = buffer.byteLength > binChunkOffset
  const trailingData = hasBinChunk ? new Uint8Array(buffer, binChunkOffset) : undefined

  return buildGlb(chunks.json, chunks.version, trailingData)
}
