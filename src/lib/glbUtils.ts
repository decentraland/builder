export const GLB_MAGIC = 0x46546c67 // 'glTF'
export const JSON_CHUNK_TYPE = 0x4e4f534a // 'JSON'
export const GLB_HEADER_SIZE = 12
export const CHUNK_HEADER_SIZE = 8
export const JSON_CHUNK_DATA_OFFSET = GLB_HEADER_SIZE + CHUNK_HEADER_SIZE // 20

export type GlbChunks = {
  json: Record<string, unknown>
  jsonChunkLength: number
  version: number
  isGlb: boolean
}

function parseGlb(buffer: ArrayBuffer): GlbChunks | null {
  if (buffer.byteLength < JSON_CHUNK_DATA_OFFSET) return null

  const view = new DataView(buffer)

  const magic = view.getUint32(0, true)
  if (magic !== GLB_MAGIC) return null

  const version = view.getUint32(4, true)
  const jsonChunkLength = view.getUint32(GLB_HEADER_SIZE, true)
  const jsonChunkType = view.getUint32(GLB_HEADER_SIZE + 4, true)
  if (jsonChunkType !== JSON_CHUNK_TYPE) return null

  const jsonBytes = new Uint8Array(buffer, JSON_CHUNK_DATA_OFFSET, jsonChunkLength)
  try {
    const json = JSON.parse(new TextDecoder().decode(jsonBytes)) as Record<string, unknown>
    return { json, jsonChunkLength, version, isGlb: true }
  } catch {
    return null
  }
}

function parseGltf(buffer: ArrayBuffer): GlbChunks | null {
  try {
    const text = new TextDecoder().decode(buffer)
    const json = JSON.parse(text) as Record<string, unknown>
    return { json, jsonChunkLength: 0, version: 0, isGlb: false }
  } catch {
    return null
  }
}

export function extractGlbChunks(buffer: ArrayBuffer): GlbChunks | null {
  return parseGlb(buffer) ?? parseGltf(buffer)
}
