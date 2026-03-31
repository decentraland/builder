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

    describe('and spring bone nodes have DCL_spring_bone_joint extension', () => {
      it('should parse spring bone params from the extension', () => {
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
        expect(bone.params).toEqual({
          stiffness: 0.5,
          gravityPower: 1.2,
          gravityDir: [0, -1, 0],
          drag: 0.3,
          center: undefined
        })
      })

      it('should use default values when extension fields are missing', () => {
        const buffer = buildGltfBuffer({
          extensionsUsed: [DCL_SPRING_BONE_EXTENSION],
          nodes: [
            {
              name: 'springbone_hair',
              extensions: {
                [DCL_SPRING_BONE_EXTENSION]: { version: 1, stiffness: 2 }
              }
            }
          ]
        })
        const result = parseSpringBones(buffer)
        const bone = result.bones[0] as { type: 'spring'; params?: Record<string, unknown> }

        expect(bone.params!.stiffness).toBe(2)
        expect(bone.params!.gravityPower).toBe(DEFAULT_SPRING_BONE_PARAMS.gravityPower)
        expect(bone.params!.gravityDir).toEqual(DEFAULT_SPRING_BONE_PARAMS.gravityDir)
        expect(bone.params!.drag).toBe(DEFAULT_SPRING_BONE_PARAMS.drag)
        expect(bone.params!.center).toBe(DEFAULT_SPRING_BONE_PARAMS.center)
      })

      it('should parse center as a string node name', () => {
        const buffer = buildGltfBuffer({
          extensionsUsed: [DCL_SPRING_BONE_EXTENSION],
          nodes: [
            { name: 'Hips' },
            {
              name: 'springbone_hair',
              extensions: {
                [DCL_SPRING_BONE_EXTENSION]: { version: 1, stiffness: 1, center: 'Hips' }
              }
            }
          ]
        })
        const result = parseSpringBones(buffer)
        const bone = result.bones[1] as { type: 'spring'; params?: Record<string, unknown> }

        expect(bone.params!.center).toBe('Hips')
      })

      it('should keep center when it points to an avatar bone', () => {
        const buffer = buildGltfBuffer({
          extensionsUsed: [DCL_SPRING_BONE_EXTENSION],
          nodes: [
            { name: 'Avatar_Hips' },
            {
              name: 'springbone_hair',
              extensions: {
                [DCL_SPRING_BONE_EXTENSION]: { version: 1, stiffness: 1, center: 'Avatar_Hips' }
              }
            }
          ]
        })
        const result = parseSpringBones(buffer)
        const bone = result.bones[1] as { type: 'spring'; params?: Record<string, unknown> }

        expect(bone.params!.center).toBe('Avatar_Hips')
      })

      it('should drop center to undefined when it points to a spring bone', () => {
        const buffer = buildGltfBuffer({
          extensionsUsed: [DCL_SPRING_BONE_EXTENSION],
          nodes: [
            {
              name: 'springbone_a',
              extensions: {
                [DCL_SPRING_BONE_EXTENSION]: { version: 1, stiffness: 1, center: 'springbone_b' }
              }
            },
            {
              name: 'springbone_b',
              extensions: {
                [DCL_SPRING_BONE_EXTENSION]: { version: 1, stiffness: 1 }
              }
            }
          ]
        })
        const result = parseSpringBones(buffer)
        const bone = result.bones[0] as { type: 'spring'; params?: Record<string, unknown> }

        expect(bone.params!.center).toBeUndefined()
      })

      it('should format numbers to 3 decimal places', () => {
        const buffer = buildGltfBuffer({
          extensionsUsed: [DCL_SPRING_BONE_EXTENSION],
          nodes: [
            {
              name: 'springbone_hair',
              extensions: {
                [DCL_SPRING_BONE_EXTENSION]: { version: 1, stiffness: 1.23456789, gravityPower: 0.1 }
              }
            }
          ]
        })
        const result = parseSpringBones(buffer)
        const bone = result.bones[0] as { type: 'spring'; params?: Record<string, unknown> }

        expect(bone.params!.stiffness).toBe(1.235)
        expect(bone.params!.gravityPower).toBe(0.1)
      })

      it('should parse gravityDir as a 3-element number array', () => {
        const buffer = buildGltfBuffer({
          extensionsUsed: [DCL_SPRING_BONE_EXTENSION],
          nodes: [
            {
              name: 'springbone_hair',
              extensions: {
                [DCL_SPRING_BONE_EXTENSION]: { version: 1, stiffness: 1, gravityDir: [1.23456, -0.5, 0] }
              }
            }
          ]
        })
        const result = parseSpringBones(buffer)
        const bone = result.bones[0] as { type: 'spring'; params?: Record<string, unknown> }

        expect(bone.params!.gravityDir).toEqual([1.235, -0.5, 0])
      })

      it('should fall back to default gravityDir when array is malformed', () => {
        const buffer = buildGltfBuffer({
          extensionsUsed: [DCL_SPRING_BONE_EXTENSION],
          nodes: [
            {
              name: 'springbone_hair',
              extensions: {
                [DCL_SPRING_BONE_EXTENSION]: { version: 1, stiffness: 1, gravityDir: [1, 2] }
              }
            }
          ]
        })
        const result = parseSpringBones(buffer)
        const bone = result.bones[0] as { type: 'spring'; params?: Record<string, unknown> }

        expect(bone.params!.gravityDir).toEqual(DEFAULT_SPRING_BONE_PARAMS.gravityDir)
      })

      it('should fall back to default gravityDir when elements are not numbers', () => {
        const buffer = buildGltfBuffer({
          extensionsUsed: [DCL_SPRING_BONE_EXTENSION],
          nodes: [
            {
              name: 'springbone_hair',
              extensions: {
                [DCL_SPRING_BONE_EXTENSION]: { version: 1, stiffness: 1, gravityDir: ['a', 'b', 'c'] }
              }
            }
          ]
        })
        const result = parseSpringBones(buffer)
        const bone = result.bones[0] as { type: 'spring'; params?: Record<string, unknown> }

        expect(bone.params!.gravityDir).toEqual(DEFAULT_SPRING_BONE_PARAMS.gravityDir)
      })
    })

    describe('and spring bone nodes have no extension', () => {
      it('should not set params on the bone', () => {
        const buffer = buildGltfBuffer({
          nodes: [{ name: 'springbone_hair' }]
        })
        const result = parseSpringBones(buffer)
        const bone = result.bones[0] as { type: 'spring'; params?: unknown }

        expect(bone.params).toBeUndefined()
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
