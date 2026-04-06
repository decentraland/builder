import { BoneNode, SpringBoneParams } from 'modules/editor/types'
import { extractGlbChunks, buildGlb, GLB_MAGIC, GLB_HEADER_SIZE, CHUNK_HEADER_SIZE, JSON_CHUNK_DATA_OFFSET } from 'lib/glbUtils'
import { patchGltfSpringBones } from './patchGltfSpringBones'
import { DCL_SPRING_BONE_EXTENSION } from './parseSpringBones'

function buildGltfBuffer(gltfJson: Record<string, unknown>): ArrayBuffer {
  return new TextEncoder().encode(JSON.stringify(gltfJson)).buffer
}

function buildGlbWithBin(jsonObj: Record<string, unknown>, binData: Uint8Array): ArrayBuffer {
  const trailing = new ArrayBuffer(CHUNK_HEADER_SIZE + binData.length)
  const trailingView = new DataView(trailing)
  const trailingBytes = new Uint8Array(trailing)
  trailingView.setUint32(0, binData.length, true)
  trailingView.setUint32(4, 0x004e4942, true) // 'BIN\0'
  trailingBytes.set(binData, CHUNK_HEADER_SIZE)

  return buildGlb(jsonObj, 2, new Uint8Array(trailing))
}

const springBone: BoneNode = { name: 'springbone_hair', nodeId: 1, type: 'spring', children: [] }
const avatarBone: BoneNode = { name: 'Hips', nodeId: 0, type: 'avatar', children: [1] }

const defaultParams: SpringBoneParams = {
  stiffness: 0.5,
  gravityPower: 1,
  gravityDir: [0, -1, 0],
  drag: 0.3,
  center: undefined
}

describe('when patching spring bones in a GLB', () => {
  describe('and the buffer is not a valid GLB or glTF', () => {
    it('should return the original buffer', () => {
      const buffer = new ArrayBuffer(4)
      const result = patchGltfSpringBones(buffer, [springBone], { springbone_hair: defaultParams })

      expect(result).toBe(buffer)
    })
  })

  describe('and the glTF has no nodes', () => {
    it('should return the original buffer', () => {
      const buffer = buildGltfBuffer({ asset: { version: '2.0' } })
      const result = patchGltfSpringBones(buffer, [springBone], { springbone_hair: defaultParams })

      expect(result).toBe(buffer)
    })
  })

  describe('and the buffer is a valid glTF with spring bone nodes', () => {
    it('should write params to DCL_spring_bone_joint extension with version and isRoot', () => {
      const gltfJson = {
        nodes: [{ name: 'Hips' }, { name: 'springbone_hair' }]
      }
      const buffer = buildGltfBuffer(gltfJson)
      const result = patchGltfSpringBones(buffer, [avatarBone, springBone], { springbone_hair: defaultParams })

      const parsed = JSON.parse(new TextDecoder().decode(result))
      const ext = parsed.nodes[1].extensions[DCL_SPRING_BONE_EXTENSION]
      expect(ext.version).toBe(1)
      expect(ext.isRoot).toBe(true)
      expect(ext.stiffness).toBe(0.5)
      expect(ext.gravityPower).toBe(1)
      expect(ext.gravityDir).toEqual([0, -1, 0])
      expect(ext.drag).toBe(0.3)
    })

    it('should add DCL_spring_bone_joint to extensionsUsed', () => {
      const gltfJson = {
        nodes: [{ name: 'Hips' }, { name: 'springbone_hair' }]
      }
      const buffer = buildGltfBuffer(gltfJson)
      const result = patchGltfSpringBones(buffer, [avatarBone, springBone], { springbone_hair: defaultParams })

      const parsed = JSON.parse(new TextDecoder().decode(result))
      expect(parsed.extensionsUsed).toContain(DCL_SPRING_BONE_EXTENSION)
    })

    it('should not duplicate DCL_spring_bone_joint in extensionsUsed if already present', () => {
      const gltfJson = {
        extensionsUsed: [DCL_SPRING_BONE_EXTENSION],
        nodes: [{ name: 'Hips' }, { name: 'springbone_hair' }]
      }
      const buffer = buildGltfBuffer(gltfJson)
      const result = patchGltfSpringBones(buffer, [avatarBone, springBone], { springbone_hair: defaultParams })

      const parsed = JSON.parse(new TextDecoder().decode(result))
      const count = parsed.extensionsUsed.filter((e: string) => e === DCL_SPRING_BONE_EXTENSION).length
      expect(count).toBe(1)
    })

    it('should set center in extension when params.center is defined', () => {
      const gltfJson = {
        nodes: [{ name: 'Hips' }, { name: 'springbone_hair' }]
      }
      const paramsWithCenter: SpringBoneParams = { ...defaultParams, center: 'Hips' }
      const buffer = buildGltfBuffer(gltfJson)
      const result = patchGltfSpringBones(buffer, [avatarBone, springBone], { springbone_hair: paramsWithCenter })

      const parsed = JSON.parse(new TextDecoder().decode(result))
      const ext = parsed.nodes[1].extensions[DCL_SPRING_BONE_EXTENSION]
      expect(ext.center).toBe('Hips')
    })

    it('should omit center from extension when params.center is undefined', () => {
      const gltfJson = {
        nodes: [{ name: 'Hips' }, { name: 'springbone_hair' }]
      }
      const buffer = buildGltfBuffer(gltfJson)
      const result = patchGltfSpringBones(buffer, [avatarBone, springBone], { springbone_hair: defaultParams })

      const parsed = JSON.parse(new TextDecoder().decode(result))
      const ext = parsed.nodes[1].extensions[DCL_SPRING_BONE_EXTENSION]
      expect(ext.center).toBeUndefined()
    })

    it('should remove extension when node is not present in the params map', () => {
      const gltfJson = {
        extensionsUsed: [DCL_SPRING_BONE_EXTENSION],
        nodes: [
          { name: 'Hips' },
          {
            name: 'springbone_hair',
            extensions: {
              [DCL_SPRING_BONE_EXTENSION]: { version: 1, stiffness: 99 }
            }
          }
        ]
      }
      const buffer = buildGltfBuffer(gltfJson)
      const result = patchGltfSpringBones(buffer, [avatarBone, springBone], {})

      const parsed = JSON.parse(new TextDecoder().decode(result))
      expect(parsed.nodes[1].extensions[DCL_SPRING_BONE_EXTENSION]).toBeUndefined()
    })

    it('should not mutate the avatar bone nodes', () => {
      const gltfJson = {
        nodes: [{ name: 'Hips', extras: { custom: 'value' } }, { name: 'springbone_hair' }]
      }
      const buffer = buildGltfBuffer(gltfJson)
      const result = patchGltfSpringBones(buffer, [avatarBone, springBone], { springbone_hair: defaultParams })

      const parsed = JSON.parse(new TextDecoder().decode(result))
      expect(parsed.nodes[0].extras).toEqual({ custom: 'value' })
    })
  })

  describe('and the buffer is a valid GLB', () => {
    it('should write correct GLB header with magic, version, and totalLength', () => {
      const gltfJson = {
        nodes: [{ name: 'springbone_hair' }]
      }
      const glbBone: BoneNode = { name: 'springbone_hair', nodeId: 0, type: 'spring', children: [] }
      const buffer = buildGlb(gltfJson)
      const result = patchGltfSpringBones(buffer, [glbBone], { springbone_hair: defaultParams })

      const view = new DataView(result)
      expect(view.getUint32(0, true)).toBe(GLB_MAGIC)
      expect(view.getUint32(4, true)).toBe(2)
      expect(view.getUint32(8, true)).toBe(result.byteLength)
    })

    it('should pad the JSON chunk to 4-byte alignment', () => {
      const gltfJson = {
        nodes: [{ name: 'springbone_hair' }]
      }
      const glbBone: BoneNode = { name: 'springbone_hair', nodeId: 0, type: 'spring', children: [] }
      const buffer = buildGlb(gltfJson)
      const result = patchGltfSpringBones(buffer, [glbBone], { springbone_hair: defaultParams })

      const view = new DataView(result)
      const jsonChunkLength = view.getUint32(GLB_HEADER_SIZE, true)
      expect(jsonChunkLength % 4).toBe(0)
    })

    it('should preserve the BIN chunk verbatim', () => {
      const gltfJson = {
        nodes: [{ name: 'springbone_hair' }]
      }
      const binData = new Uint8Array([10, 20, 30, 40, 50, 60, 70, 80])
      const glbBone: BoneNode = { name: 'springbone_hair', nodeId: 0, type: 'spring', children: [] }
      const buffer = buildGlbWithBin(gltfJson, binData)
      const result = patchGltfSpringBones(buffer, [glbBone], { springbone_hair: defaultParams })

      const resultView = new DataView(result)
      const newJsonChunkLength = resultView.getUint32(GLB_HEADER_SIZE, true)
      const binOffset = JSON_CHUNK_DATA_OFFSET + newJsonChunkLength

      const binChunkLength = resultView.getUint32(binOffset, true)
      expect(binChunkLength).toBe(binData.length)

      const resultBinData = new Uint8Array(result, binOffset + CHUNK_HEADER_SIZE, binChunkLength)
      expect(Array.from(resultBinData)).toEqual(Array.from(binData))
    })

    it('should produce a valid GLB that can be re-parsed', () => {
      const gltfJson = {
        nodes: [{ name: 'Hips' }, { name: 'springbone_hair' }]
      }
      const buffer = buildGlb(gltfJson)
      const result = patchGltfSpringBones(buffer, [avatarBone, springBone], { springbone_hair: defaultParams })

      const chunks = extractGlbChunks(result)
      expect(chunks).not.toBeNull()
      expect(chunks!.isGlb).toBe(true)
      const json = chunks!.json as { nodes: Array<{ extensions?: Record<string, unknown> }> }
      const ext = json.nodes[1].extensions![DCL_SPRING_BONE_EXTENSION] as Record<string, unknown>
      expect(ext.stiffness).toBe(0.5)
      expect(ext.version).toBe(1)
      expect(ext.isRoot).toBe(true)
    })
  })

  describe('and a spring bone nodeId is out of range', () => {
    it('should warn and skip the out-of-range node', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation()
      const gltfJson = {
        nodes: [{ name: 'Hips' }]
      }
      const outOfRangeBone: BoneNode = { name: 'springbone_missing', nodeId: 99, type: 'spring', children: [] }
      const buffer = buildGltfBuffer(gltfJson)
      patchGltfSpringBones(buffer, [outOfRangeBone], { springbone_missing: defaultParams })

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('nodeId 99 out of range'))
      warnSpy.mockRestore()
    })
  })

  describe('and the input buffer should not be mutated', () => {
    it('should return a new ArrayBuffer without modifying the original', () => {
      const gltfJson = {
        nodes: [{ name: 'springbone_hair' }]
      }
      const glbBone: BoneNode = { name: 'springbone_hair', nodeId: 0, type: 'spring', children: [] }
      const buffer = buildGlb(gltfJson)
      const originalBytes = new Uint8Array(buffer.slice(0))

      const result = patchGltfSpringBones(buffer, [glbBone], { springbone_hair: defaultParams })

      expect(result).not.toBe(buffer)
      expect(Array.from(new Uint8Array(buffer))).toEqual(Array.from(originalBytes))
    })
  })
})
