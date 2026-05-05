import { buildGlb } from 'lib/glbUtils'
import { parseSpringBones } from './parseSpringBones'

function buildGltfBuffer(gltfJson: Record<string, unknown>): ArrayBuffer {
  return new TextEncoder().encode(JSON.stringify(gltfJson)).buffer
}

describe('when parsing spring bones', () => {
  describe('and the buffer is invalid', () => {
    it('should return an empty bones array', () => {
      const buffer = new ArrayBuffer(4)
      expect(parseSpringBones(buffer)).toEqual({ bones: [] })
    })
  })

  describe('and the gltf has no nodes', () => {
    it('should return an empty bones array', () => {
      const buffer = buildGltfBuffer({ asset: { version: '2.0' } })
      expect(parseSpringBones(buffer)).toEqual({ bones: [] })
    })
  })

  describe('and the gltf has nodes', () => {
    describe('and no nodes are spring bones', () => {
      it('should classify all nodes as avatar type', () => {
        const buffer = buildGltfBuffer({
          nodes: [{ name: 'Hips', children: [1] }, { name: 'Spine' }]
        })
        const result = parseSpringBones(buffer)

        expect(result.bones).toHaveLength(2)
        expect(result.bones[0]).toEqual({ name: 'Hips', nodeId: 0, type: 'avatar', children: [1] })
        expect(result.bones[1]).toEqual({ name: 'Spine', nodeId: 1, type: 'avatar', children: [] })
      })
    })

    describe('and nodes contain spring bone names', () => {
      it('should classify nodes with "springbone" in the name as spring type', () => {
        const buffer = buildGltfBuffer({
          nodes: [{ name: 'Hips' }, { name: 'springbone_hair', children: [2] }, { name: 'Hair_end' }]
        })
        const result = parseSpringBones(buffer)

        expect(result.bones).toHaveLength(3)
        expect(result.bones[0].type).toBe('avatar')
        expect(result.bones[1]).toEqual({ name: 'springbone_hair', nodeId: 1, type: 'spring', children: [2] })
        expect(result.bones[2].type).toBe('avatar')
      })

      it('should be case-insensitive when detecting spring bone prefix', () => {
        const buffer = buildGltfBuffer({
          nodes: [{ name: 'SpringBone_Hair' }, { name: 'SPRINGBONE_tail' }]
        })
        const result = parseSpringBones(buffer)

        expect(result.bones[0].type).toBe('spring')
        expect(result.bones[1].type).toBe('spring')
      })
    })

    describe('and nodes have no name', () => {
      it('should assign a default name based on node index', () => {
        const buffer = buildGltfBuffer({
          nodes: [{ children: [1] }, {}]
        })
        const result = parseSpringBones(buffer)

        expect(result.bones[0].name).toBe('node_0')
        expect(result.bones[1].name).toBe('node_1')
      })
    })

    describe('and the buffer is a valid GLB', () => {
      it('should parse bones from a GLB buffer', () => {
        const buffer = buildGlb({
          nodes: [{ name: 'Hips' }, { name: 'springbone_hair' }]
        })
        const result = parseSpringBones(buffer)

        expect(result.bones).toHaveLength(2)
        expect(result.bones[0].type).toBe('avatar')
        expect(result.bones[1].type).toBe('spring')
      })
    })
  })
})
