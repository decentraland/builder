import { buildGlb } from 'lib/glbUtils'
import { parseSpringBones, DEFAULT_SPRING_BONE_PARAMS, DCL_SPRING_BONE_EXTENSION } from './parseSpringBones'

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
      it('should classify nodes with "springbone" in the name as spring type with default params', () => {
        const buffer = buildGltfBuffer({
          nodes: [{ name: 'Hips' }, { name: 'springbone_hair', children: [2] }, { name: 'Hair_end' }]
        })
        const result = parseSpringBones(buffer)

        expect(result.bones).toHaveLength(3)
        expect(result.bones[0].type).toBe('avatar')
        expect(result.bones[1]).toEqual({
          name: 'springbone_hair', nodeId: 1, type: 'spring', children: [2],
          params: {
            stiffness: DEFAULT_SPRING_BONE_PARAMS.stiffness,
            gravityPower: DEFAULT_SPRING_BONE_PARAMS.gravityPower,
            gravityDir: [...DEFAULT_SPRING_BONE_PARAMS.gravityDir],
            drag: DEFAULT_SPRING_BONE_PARAMS.drag,
            center: DEFAULT_SPRING_BONE_PARAMS.center
          }
        })
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

    describe('and spring bone nodes have DCL_spring_bone_joint extension', () => {
      it('should ignore extension params and assign defaults', () => {
        const buffer = buildGltfBuffer({
          extensionsUsed: [DCL_SPRING_BONE_EXTENSION],
          nodes: [
            {
              name: 'springbone_hair',
              extensions: {
                [DCL_SPRING_BONE_EXTENSION]: {
                  version: 1,
                  stiffness: 0.5,
                  gravityPower: 1.2,
                  gravityDir: [0, -1, 0],
                  drag: 0.3,
                  isRoot: true
                }
              }
            }
          ]
        })
        const result = parseSpringBones(buffer)

        expect(result.bones[0].type).toBe('spring')
        const bone = result.bones[0] as { type: 'spring'; params?: unknown }
        // Params should be defaults, not from the extension
        expect(bone.params).toEqual({
          stiffness: DEFAULT_SPRING_BONE_PARAMS.stiffness,
          gravityPower: DEFAULT_SPRING_BONE_PARAMS.gravityPower,
          gravityDir: [...DEFAULT_SPRING_BONE_PARAMS.gravityDir],
          drag: DEFAULT_SPRING_BONE_PARAMS.drag,
          center: DEFAULT_SPRING_BONE_PARAMS.center
        })
      })
    })

    describe('and spring bone nodes have no extension', () => {
      it('should assign default params on the bone', () => {
        const buffer = buildGltfBuffer({
          nodes: [{ name: 'springbone_hair' }]
        })
        const result = parseSpringBones(buffer)
        const bone = result.bones[0] as { type: 'spring'; params?: unknown }

        expect(bone.params).toEqual({
          stiffness: DEFAULT_SPRING_BONE_PARAMS.stiffness,
          gravityPower: DEFAULT_SPRING_BONE_PARAMS.gravityPower,
          gravityDir: [...DEFAULT_SPRING_BONE_PARAMS.gravityDir],
          drag: DEFAULT_SPRING_BONE_PARAMS.drag,
          center: DEFAULT_SPRING_BONE_PARAMS.center
        })
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
          extensionsUsed: [DCL_SPRING_BONE_EXTENSION],
          nodes: [
            { name: 'Hips' },
            {
              name: 'springbone_hair',
              extensions: {
                [DCL_SPRING_BONE_EXTENSION]: { version: 1, stiffness: 0.8 }
              }
            }
          ]
        })
        const result = parseSpringBones(buffer)

        expect(result.bones).toHaveLength(2)
        expect(result.bones[0].type).toBe('avatar')
        expect(result.bones[1].type).toBe('spring')
      })
    })
  })
})
