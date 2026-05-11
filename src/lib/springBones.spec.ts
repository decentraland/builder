import { BoneNode } from 'modules/editor/types'
import { Item, ItemType, WearableData, WearableRepresentation } from 'modules/item/types'
import { BodyShape, SpringBoneParams } from '@dcl/schemas'
import { MAX_SPRING_BONES } from 'lib/glbValidation/constants'
import { buildGlb } from 'lib/glbUtils'
import {
  SPRING_BONES_VERSION,
  getDefaultSpringBoneParams,
  getDefaultSpringBoneRoots,
  seedSpringBonesForUpdate,
  seedSpringBonesForUpload
} from './springBones'

function makeBlob(buffer: ArrayBuffer): Blob {
  return { arrayBuffer: () => Promise.resolve(buffer) } as unknown as Blob
}

function makeRepresentation(bodyShape: BodyShape, mainFile: string): WearableRepresentation {
  return {
    bodyShapes: [bodyShape],
    mainFile,
    contents: [mainFile],
    overrideHides: [],
    overrideReplaces: []
  }
}

const avatar = (nodeId: number, name: string, children: number[] = []): BoneNode => ({
  nodeId,
  name,
  type: 'avatar',
  children
})

const spring = (nodeId: number, name: string, children: number[] = []): BoneNode => ({
  nodeId,
  name,
  type: 'spring',
  children
})

describe('when getting default spring bone roots', () => {
  describe('and the bones array is empty', () => {
    it('should return an empty record', () => {
      expect(getDefaultSpringBoneRoots([])).toEqual({})
    })
  })

  describe('and no bones are spring bones', () => {
    it('should return an empty record', () => {
      const bones = [avatar(0, 'Hips', [1]), avatar(1, 'Spine')]
      expect(getDefaultSpringBoneRoots(bones)).toEqual({})
    })
  })

  describe('and a single chain has one root and three children', () => {
    it('should return one entry for the chain root only', () => {
      const bones: BoneNode[] = [
        avatar(0, 'Hips', [1]),
        spring(1, 'springbone_hair_root', [2]),
        spring(2, 'springbone_hair_mid', [3]),
        spring(3, 'springbone_hair_tip')
      ]
      const result = getDefaultSpringBoneRoots(bones)
      expect(Object.keys(result)).toEqual(['springbone_hair_root'])
      expect(result['springbone_hair_root']).toEqual(getDefaultSpringBoneParams())
    })
  })

  describe('and multiple sibling chains exist', () => {
    it('should return one entry per chain root', () => {
      const bones: BoneNode[] = [
        avatar(0, 'Hips', [1, 3]),
        spring(1, 'springbone_left_root', [2]),
        spring(2, 'springbone_left_tip'),
        spring(3, 'springbone_right_root', [4]),
        spring(4, 'springbone_right_tip')
      ]
      const result = getDefaultSpringBoneRoots(bones)
      expect(Object.keys(result).sort()).toEqual(['springbone_left_root', 'springbone_right_root'])
    })
  })

  describe('and more than MAX_SPRING_BONES leaf roots exist (each subtree size = 1)', () => {
    it('should return the first MAX_SPRING_BONES roots in input order and ignore the rest', () => {
      const bones: BoneNode[] = []
      const childIds: number[] = []
      const total = MAX_SPRING_BONES + 2
      for (let i = 1; i <= total; i++) {
        childIds.push(i)
        bones.push(spring(i, `springbone_${i}`))
      }
      bones.unshift(avatar(0, 'Hips', childIds))

      const result = getDefaultSpringBoneRoots(bones)
      const names = Object.keys(result)
      expect(names).toHaveLength(MAX_SPRING_BONES)
      expect(names[0]).toBe('springbone_1')
      expect(names[MAX_SPRING_BONES - 1]).toBe(`springbone_${MAX_SPRING_BONES}`)
      expect(names).not.toContain(`springbone_${MAX_SPRING_BONES + 1}`)
    })
  })

  describe("and a single root's subtree alone exceeds MAX_SPRING_BONES", () => {
    it('should reject the over-cap root and return an empty record', () => {
      const childCount = MAX_SPRING_BONES + 2
      const bones: BoneNode[] = [avatar(0, 'Hips', [1])]
      const childIds = Array.from({ length: childCount }, (_, i) => i + 2)
      bones.push(spring(1, 'springbone_giant', childIds))
      for (const childId of childIds) {
        bones.push(spring(childId, `springbone_child_${childId}`))
      }

      expect(getDefaultSpringBoneRoots(bones)).toEqual({})
    })
  })

  describe('and admitting all roots would exceed the subtree-size cap', () => {
    it('should admit roots greedily until the next would exceed the cap', () => {
      // Root A: subtree size 8 (1 + 7 children). Root B: subtree size 5. Root C: subtree size 1.
      // MAX_SPRING_BONES = 12. Greedy: 8 + 5 = 13 > 12, so reject B. 8 + 1 = 9 ≤ 12, accept C.
      const aChildren = [10, 11, 12, 13, 14, 15, 16]
      const bChildren = [20, 21, 22, 23]
      const bones: BoneNode[] = [
        avatar(0, 'Hips', [1, 2, 3]),
        spring(1, 'springbone_A', aChildren),
        spring(2, 'springbone_B', bChildren),
        spring(3, 'springbone_C')
      ]
      for (const id of aChildren) bones.push(spring(id, `A_child_${id}`))
      for (const id of bChildren) bones.push(spring(id, `B_child_${id}`))

      const result = getDefaultSpringBoneRoots(bones)
      expect(Object.keys(result).sort()).toEqual(['springbone_A', 'springbone_C'])
    })
  })

  describe('and a spring bone has no parent (top-level node)', () => {
    it('should treat the orphan spring bone as a chain root', () => {
      const bones: BoneNode[] = [spring(0, 'springbone_top_level', [1]), spring(1, 'springbone_child')]
      const result = getDefaultSpringBoneRoots(bones)
      expect(Object.keys(result)).toEqual(['springbone_top_level'])
    })
  })

  describe('and the helper is called repeatedly', () => {
    it('should return fresh objects so callers cannot mutate shared state', () => {
      const bones: BoneNode[] = [avatar(0, 'Hips', [1]), spring(1, 'springbone_root')]
      const a = getDefaultSpringBoneRoots(bones)
      const b = getDefaultSpringBoneRoots(bones)
      expect(a['springbone_root']).not.toBe(b['springbone_root'])
      expect(a['springbone_root'].gravityDir).not.toBe(b['springbone_root'].gravityDir)
    })
  })
})

describe('when seeding spring bones for an upload', () => {
  describe('and the GLB has no spring bone nodes', () => {
    it('should return undefined so data.springBones is left unset', async () => {
      const buffer = buildGlb({ nodes: [{ name: 'Hips' }, { name: 'Spine' }] })
      const representations = [makeRepresentation(BodyShape.MALE, 'male/model.glb')]
      const blobs = { 'male/model.glb': makeBlob(buffer) }
      const hashes = { 'male/model.glb': 'hash-male' }

      const result = await seedSpringBonesForUpload(representations, blobs, hashes)
      expect(result).toBeUndefined()
    })
  })

  describe('and the GLB contains a single chain root', () => {
    it('should return SpringBonesData keyed by content hash with default params for the root', async () => {
      const buffer = buildGlb({
        nodes: [{ name: 'Hips', children: [1] }, { name: 'springbone_hair' }]
      })
      const representations = [makeRepresentation(BodyShape.MALE, 'male/model.glb')]
      const blobs = { 'male/model.glb': makeBlob(buffer) }
      const hashes = { 'male/model.glb': 'hash-male' }

      const result = await seedSpringBonesForUpload(representations, blobs, hashes)
      expect(result).toEqual({
        version: SPRING_BONES_VERSION,
        models: { 'hash-male': { springbone_hair: getDefaultSpringBoneParams() } }
      })
    })
  })

  describe('and the upload has two body-shape representations with different GLBs', () => {
    it('should seed defaults for each representation under its own hash', async () => {
      const maleBuffer = buildGlb({
        nodes: [{ name: 'Hips', children: [1] }, { name: 'springbone_male' }]
      })
      const femaleBuffer = buildGlb({
        nodes: [{ name: 'Hips', children: [1] }, { name: 'springbone_female' }]
      })
      const representations = [
        makeRepresentation(BodyShape.MALE, 'male/model.glb'),
        makeRepresentation(BodyShape.FEMALE, 'female/model.glb')
      ]
      const blobs = {
        'male/model.glb': makeBlob(maleBuffer),
        'female/model.glb': makeBlob(femaleBuffer)
      }
      const hashes = { 'male/model.glb': 'hash-male', 'female/model.glb': 'hash-female' }

      const result = await seedSpringBonesForUpload(representations, blobs, hashes)
      expect(result?.models['hash-male']).toEqual({ springbone_male: getDefaultSpringBoneParams() })
      expect(result?.models['hash-female']).toEqual({ springbone_female: getDefaultSpringBoneParams() })
    })
  })

  describe('and two representations share the same GLB hash', () => {
    it('should seed only once for that hash to avoid duplicate work', async () => {
      const buffer = buildGlb({
        nodes: [{ name: 'Hips', children: [1] }, { name: 'springbone_shared' }]
      })
      const representations = [
        makeRepresentation(BodyShape.MALE, 'shared/model.glb'),
        makeRepresentation(BodyShape.FEMALE, 'shared/model.glb')
      ]
      const blobs = { 'shared/model.glb': makeBlob(buffer) }
      const hashes = { 'shared/model.glb': 'hash-shared' }

      const result = await seedSpringBonesForUpload(representations, blobs, hashes)
      expect(Object.keys(result?.models ?? {})).toEqual(['hash-shared'])
    })
  })

  describe('and the GLB contains more than MAX_SPRING_BONES chain roots', () => {
    it('should seed only the first MAX_SPRING_BONES in GLB-node order', async () => {
      const total = MAX_SPRING_BONES + 3
      const childIds = Array.from({ length: total }, (_, i) => i + 1)
      const nodes: Array<{ name: string; children?: number[] }> = [{ name: 'Hips', children: childIds }]
      for (let i = 1; i <= total; i++) {
        nodes.push({ name: `springbone_${i}` })
      }
      const buffer = buildGlb({ nodes })
      const representations = [makeRepresentation(BodyShape.MALE, 'male/model.glb')]
      const blobs = { 'male/model.glb': makeBlob(buffer) }
      const hashes = { 'male/model.glb': 'hash-male' }

      const result = await seedSpringBonesForUpload(representations, blobs, hashes)
      const seededNames = Object.keys(result?.models['hash-male'] ?? {})
      expect(seededNames).toHaveLength(MAX_SPRING_BONES)
      expect(seededNames).not.toContain(`springbone_${MAX_SPRING_BONES + 1}`)
    })
  })

  describe('and a representation references a missing blob', () => {
    it('should skip that representation without throwing', async () => {
      const representations = [makeRepresentation(BodyShape.MALE, 'missing.glb')]
      const result = await seedSpringBonesForUpload(representations, {}, { 'missing.glb': 'hash' })
      expect(result).toBeUndefined()
    })
  })

  describe('and the GLB blob throws while reading its array buffer', () => {
    it('should swallow the error, log a warning, and return undefined when no other roots exist', async () => {
      const failingBlob = { arrayBuffer: () => Promise.reject(new Error('boom')) } as unknown as Blob
      const representations = [makeRepresentation(BodyShape.MALE, 'male/model.glb')]
      const blobs = { 'male/model.glb': failingBlob }
      const hashes = { 'male/model.glb': 'hash-male' }

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
      try {
        const result = await seedSpringBonesForUpload(representations, blobs, hashes)
        expect(result).toBeUndefined()
        expect(warnSpy).toHaveBeenCalled()
      } finally {
        warnSpy.mockRestore()
      }
    })
  })
})

describe('when seeding spring bones for an item update', () => {
  /** Minimal wearable Item factory — only the fields the helper actually touches. */
  function buildWearable({
    representations,
    contents,
    springBones
  }: {
    representations: WearableRepresentation[]
    contents: Record<string, string>
    springBones?: WearableData['springBones']
  }): Item {
    return {
      type: ItemType.WEARABLE,
      contents,
      data: { representations, springBones } as WearableData
    } as Item
  }

  /** A non-default param shape so we can prove "existing wins" assertions without colliding with defaults. */
  const tunedParams: SpringBoneParams = {
    stiffness: 9.9,
    gravityPower: 7,
    gravityDir: [0, -1, 0],
    drag: 0.1,
    center: undefined,
    isRoot: true
  }

  describe('and the GLB hash changes (model swap) with the prior hash holding tuned params', () => {
    it('should drop the orphan hash and seed defaults for the new hash', async () => {
      const newBuffer = buildGlb({ nodes: [{ name: 'Hips', children: [1] }, { name: 'springbone_hair' }] })
      const representations = [makeRepresentation(BodyShape.MALE, 'male/model.glb')]
      const blobs = { 'male/model.glb': makeBlob(newBuffer) }
      const hashes = { 'male/model.glb': 'hash-new' }

      const pristineItem = buildWearable({
        representations,
        contents: { 'male/model.glb': 'hash-old' },
        springBones: { version: SPRING_BONES_VERSION, models: { 'hash-old': { springbone_hair: tunedParams } } }
      })
      const updatedItem = buildWearable({ representations, contents: hashes })

      const result = await seedSpringBonesForUpdate(pristineItem, updatedItem, representations, blobs, hashes)
      expect(result).toEqual({
        version: SPRING_BONES_VERSION,
        models: { 'hash-new': { springbone_hair: getDefaultSpringBoneParams() } }
      })
    })
  })

  describe('and the new GLB has the same hash as the existing one (identical bytes)', () => {
    it('should preserve the tuned params and not overwrite them with defaults', async () => {
      const buffer = buildGlb({ nodes: [{ name: 'Hips', children: [1] }, { name: 'springbone_hair' }] })
      const representations = [makeRepresentation(BodyShape.MALE, 'male/model.glb')]
      const blobs = { 'male/model.glb': makeBlob(buffer) }
      const hashes = { 'male/model.glb': 'hash-shared' }

      const pristineItem = buildWearable({
        representations,
        contents: hashes,
        springBones: { version: SPRING_BONES_VERSION, models: { 'hash-shared': { springbone_hair: tunedParams } } }
      })
      const updatedItem = buildWearable({ representations, contents: hashes })

      const result = await seedSpringBonesForUpdate(pristineItem, updatedItem, representations, blobs, hashes)
      expect(result?.models['hash-shared']).toEqual({ springbone_hair: tunedParams })
    })
  })

  describe('and the new GLB has no spring bones (replacing a previously-tuned model)', () => {
    it('should drop the prior hash and return undefined since no entries remain', async () => {
      const newBuffer = buildGlb({ nodes: [{ name: 'Hips' }, { name: 'Spine' }] })
      const representations = [makeRepresentation(BodyShape.MALE, 'male/model.glb')]
      const blobs = { 'male/model.glb': makeBlob(newBuffer) }
      const hashes = { 'male/model.glb': 'hash-new' }

      const pristineItem = buildWearable({
        representations,
        contents: { 'male/model.glb': 'hash-old' },
        springBones: { version: SPRING_BONES_VERSION, models: { 'hash-old': { springbone_hair: tunedParams } } }
      })
      const updatedItem = buildWearable({ representations, contents: hashes })

      const result = await seedSpringBonesForUpdate(pristineItem, updatedItem, representations, blobs, hashes)
      expect(result).toBeUndefined()
    })
  })

  describe('and a multi-model item is replaced wholesale with a single new shape (matches modifyItem semantics)', () => {
    it('should drop both prior tuned entries and seed defaults for the new hash only', async () => {
      // Mirrors what CreateSingleItemModal.modifyItem actually does for a multi-model wearable:
      // when the user uploads one shape, the modal replaces `item.data.representations` wholesale
      // and `item.contents` only holds the new path. Both prior hashes are unreachable post-update.
      const newMaleBuffer = buildGlb({ nodes: [{ name: 'Hips', children: [1] }, { name: 'springbone_new_male' }] })
      const newRepresentations = [makeRepresentation(BodyShape.MALE, 'male/model.glb')]
      const blobs = { 'male/model.glb': makeBlob(newMaleBuffer) }
      const newContents = { 'male/model.glb': 'hash-male-new' }

      const pristineItem = buildWearable({
        representations: [makeRepresentation(BodyShape.MALE, 'male/model.glb'), makeRepresentation(BodyShape.FEMALE, 'female/model.glb')],
        contents: { 'male/model.glb': 'hash-male-old', 'female/model.glb': 'hash-female' },
        springBones: {
          version: SPRING_BONES_VERSION,
          models: {
            'hash-male-old': { springbone_old_male: tunedParams },
            'hash-female': { springbone_female: tunedParams }
          }
        }
      })
      const updatedItem = buildWearable({ representations: newRepresentations, contents: newContents })

      const result = await seedSpringBonesForUpdate(pristineItem, updatedItem, newRepresentations, blobs, newContents)
      expect(result).toEqual({
        version: SPRING_BONES_VERSION,
        models: { 'hash-male-new': { springbone_new_male: getDefaultSpringBoneParams() } }
      })
    })
  })

  describe('and a second representation is added that points at a novel GLB', () => {
    it('should preserve the existing rep entry and seed defaults for the new hash', async () => {
      const femaleBuffer = buildGlb({ nodes: [{ name: 'Hips', children: [1] }, { name: 'springbone_female' }] })
      const representations = [
        makeRepresentation(BodyShape.MALE, 'male/model.glb'),
        makeRepresentation(BodyShape.FEMALE, 'female/model.glb')
      ]
      const blobs = { 'female/model.glb': makeBlob(femaleBuffer) }
      const hashes = { 'male/model.glb': 'hash-male', 'female/model.glb': 'hash-female' }

      const pristineItem = buildWearable({
        representations: [makeRepresentation(BodyShape.MALE, 'male/model.glb')],
        contents: { 'male/model.glb': 'hash-male' },
        springBones: { version: SPRING_BONES_VERSION, models: { 'hash-male': { springbone_male: tunedParams } } }
      })
      const updatedItem = buildWearable({ representations, contents: hashes })

      const result = await seedSpringBonesForUpdate(pristineItem, updatedItem, representations, blobs, hashes)
      expect(result?.models['hash-male']).toEqual({ springbone_male: tunedParams })
      expect(result?.models['hash-female']).toEqual({ springbone_female: getDefaultSpringBoneParams() })
    })
  })

  describe('and a second representation is added pointing at the same GLB hash as the existing one', () => {
    it('should preserve the existing tuned entry and not duplicate it', async () => {
      const buffer = buildGlb({ nodes: [{ name: 'Hips', children: [1] }, { name: 'springbone_shared' }] })
      const representations = [
        makeRepresentation(BodyShape.MALE, 'shared/model.glb'),
        makeRepresentation(BodyShape.FEMALE, 'shared/model.glb')
      ]
      const blobs = { 'shared/model.glb': makeBlob(buffer) }
      const hashes = { 'shared/model.glb': 'hash-shared' }

      const pristineItem = buildWearable({
        representations: [makeRepresentation(BodyShape.MALE, 'shared/model.glb')],
        contents: hashes,
        springBones: { version: SPRING_BONES_VERSION, models: { 'hash-shared': { springbone_shared: tunedParams } } }
      })
      const updatedItem = buildWearable({ representations, contents: hashes })

      const result = await seedSpringBonesForUpdate(pristineItem, updatedItem, representations, blobs, hashes)
      expect(Object.keys(result?.models ?? {})).toEqual(['hash-shared'])
      expect(result?.models['hash-shared']).toEqual({ springbone_shared: tunedParams })
    })
  })

  describe('and parsing the new GLB throws', () => {
    it('should fall back to the surviving existing entries without blocking the update', async () => {
      const failingBlob = { arrayBuffer: () => Promise.reject(new Error('boom')) } as unknown as Blob
      const representations = [
        makeRepresentation(BodyShape.MALE, 'male/model.glb'),
        makeRepresentation(BodyShape.FEMALE, 'female/model.glb')
      ]
      const blobs = { 'male/model.glb': failingBlob }
      const newContents = { 'male/model.glb': 'hash-male-new', 'female/model.glb': 'hash-female' }

      const pristineItem = buildWearable({
        representations,
        contents: { 'male/model.glb': 'hash-male-old', 'female/model.glb': 'hash-female' },
        springBones: {
          version: SPRING_BONES_VERSION,
          models: {
            'hash-male-old': { springbone_old_male: tunedParams },
            'hash-female': { springbone_female: tunedParams }
          }
        }
      })
      const updatedItem = buildWearable({ representations, contents: newContents })

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
      try {
        const result = await seedSpringBonesForUpdate(pristineItem, updatedItem, representations, blobs, newContents)
        // Male-old hash is no longer reachable → dropped. Female still reachable → preserved.
        // Male-new parse failed → no seed for it. Net result: only the female entry survives.
        expect(result?.models['hash-male-old']).toBeUndefined()
        expect(result?.models['hash-male-new']).toBeUndefined()
        expect(result?.models['hash-female']).toEqual({ springbone_female: tunedParams })
        expect(warnSpy).toHaveBeenCalled()
      } finally {
        warnSpy.mockRestore()
      }
    })
  })
})
