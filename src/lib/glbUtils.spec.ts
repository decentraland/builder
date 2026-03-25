import { extractGlbChunks, buildGlb, GLB_MAGIC, JSON_CHUNK_TYPE, GLB_HEADER_SIZE, CHUNK_HEADER_SIZE, JSON_CHUNK_DATA_OFFSET } from './glbUtils'

function buildGlbWithBin(jsonObj: Record<string, unknown>, binData: Uint8Array): ArrayBuffer {
  const trailing = new ArrayBuffer(CHUNK_HEADER_SIZE + binData.length)
  const trailingView = new DataView(trailing)
  const trailingBytes = new Uint8Array(trailing)
  trailingView.setUint32(0, binData.length, true)
  trailingView.setUint32(4, 0x004e4942, true) // 'BIN\0'
  trailingBytes.set(binData, CHUNK_HEADER_SIZE)

  return buildGlb(jsonObj, 2, new Uint8Array(trailing))
}

describe('when extracting GLB chunks', () => {
  describe('and the buffer is smaller than the minimum GLB header size', () => {
    it('should return null', () => {
      const buffer = new ArrayBuffer(10)
      expect(extractGlbChunks(buffer)).toBeNull()
    })
  })

  describe('and the buffer has a wrong magic number', () => {
    it('should return null', () => {
      const buffer = new ArrayBuffer(JSON_CHUNK_DATA_OFFSET + 4)
      const view = new DataView(buffer)
      view.setUint32(0, 0x00000000, true) // wrong magic
      expect(extractGlbChunks(buffer)).toBeNull()
    })
  })

  describe('and the buffer has a wrong JSON chunk type', () => {
    it('should return null', () => {
      const buffer = new ArrayBuffer(JSON_CHUNK_DATA_OFFSET + 4)
      const view = new DataView(buffer)
      view.setUint32(0, GLB_MAGIC, true)
      view.setUint32(4, 2, true)
      view.setUint32(GLB_HEADER_SIZE, 4, true)
      view.setUint32(GLB_HEADER_SIZE + 4, 0x00000000, true) // wrong chunk type
      expect(extractGlbChunks(buffer)).toBeNull()
    })
  })

  describe('and the buffer contains invalid JSON in the JSON chunk', () => {
    it('should return null', () => {
      const buffer = new ArrayBuffer(JSON_CHUNK_DATA_OFFSET + 8)
      const view = new DataView(buffer)
      const bytes = new Uint8Array(buffer)
      view.setUint32(0, GLB_MAGIC, true)
      view.setUint32(4, 2, true)
      view.setUint32(GLB_HEADER_SIZE, 8, true)
      view.setUint32(GLB_HEADER_SIZE + 4, JSON_CHUNK_TYPE, true)
      bytes.set(new TextEncoder().encode('not json'), JSON_CHUNK_DATA_OFFSET)
      expect(extractGlbChunks(buffer)).toBeNull()
    })
  })

  describe('and the buffer is a valid GLB', () => {
    it('should parse and return json, jsonChunkLength, version, and isGlb as true', () => {
      const jsonObj = { asset: { version: '2.0' }, nodes: [] }
      const buffer = buildGlb(jsonObj)
      const result = extractGlbChunks(buffer)

      expect(result).not.toBeNull()
      expect(result!.isGlb).toBe(true)
      expect(result!.version).toBe(2)
      expect(result!.json).toEqual(jsonObj)
      expect(result!.jsonChunkLength).toBeGreaterThan(0)
    })
  })

  describe('and the buffer is a valid GLB with a BIN chunk', () => {
    it('should parse the JSON chunk and return correct jsonChunkLength', () => {
      const jsonObj = { asset: { version: '2.0' } }
      const binData = new Uint8Array([1, 2, 3, 4])
      const buffer = buildGlbWithBin(jsonObj, binData)
      const result = extractGlbChunks(buffer)

      expect(result).not.toBeNull()
      expect(result!.isGlb).toBe(true)
      expect(result!.json).toEqual(jsonObj)
    })
  })

  describe('and the buffer is a plain .gltf JSON file', () => {
    it('should parse and return json with isGlb as false', () => {
      const jsonObj = { asset: { version: '2.0' }, nodes: [] }
      const encoder = new TextEncoder()
      const buffer = encoder.encode(JSON.stringify(jsonObj)).buffer

      const result = extractGlbChunks(buffer)
      expect(result).not.toBeNull()
      expect(result!.isGlb).toBe(false)
      expect(result!.json).toEqual(jsonObj)
      expect(result!.jsonChunkLength).toBe(0)
      expect(result!.version).toBe(0)
    })
  })

  describe('and the buffer is a plain text file with invalid JSON', () => {
    it('should return null', () => {
      const encoder = new TextEncoder()
      const buffer = encoder.encode('this is not json at all').buffer
      expect(extractGlbChunks(buffer)).toBeNull()
    })
  })
})

describe('when building a GLB', () => {
  it('should produce a valid GLB that can be parsed by extractGlbChunks', () => {
    const jsonObj = { asset: { version: '2.0' }, nodes: [] }
    const buffer = buildGlb(jsonObj)
    const result = extractGlbChunks(buffer)

    expect(result).not.toBeNull()
    expect(result!.isGlb).toBe(true)
    expect(result!.json).toEqual(jsonObj)
  })

  it('should use version 2 by default', () => {
    const buffer = buildGlb({ asset: {} })
    const view = new DataView(buffer)
    expect(view.getUint32(4, true)).toBe(2)
  })

  it('should use the provided version', () => {
    const buffer = buildGlb({ asset: {} }, 3)
    const view = new DataView(buffer)
    expect(view.getUint32(4, true)).toBe(3)
  })

  it('should pad the JSON chunk to 4-byte alignment', () => {
    const buffer = buildGlb({ a: 1 })
    const view = new DataView(buffer)
    const jsonChunkLength = view.getUint32(GLB_HEADER_SIZE, true)
    expect(jsonChunkLength % 4).toBe(0)
  })

  it('should append trailing data after the JSON chunk', () => {
    const trailing = new Uint8Array([10, 20, 30, 40])
    const buffer = buildGlb({ a: 1 }, 2, trailing)
    const view = new DataView(buffer)
    const jsonChunkLength = view.getUint32(GLB_HEADER_SIZE, true)
    const trailingOffset = JSON_CHUNK_DATA_OFFSET + jsonChunkLength

    const resultTrailing = new Uint8Array(buffer, trailingOffset)
    expect(Array.from(resultTrailing)).toEqual(Array.from(trailing))
  })
})
