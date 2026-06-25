import { WearableCategory } from '@dcl/schemas'
import { suggestWearableCategory } from './suggestWearableCategory'

type ThreeModules = typeof import('three')

// Mock Three.js classes that support instanceof checks, mirroring wearableValidators.spec.ts.
function createMockThree() {
  class MockMesh {
    material: any
    geometry: any
    name: string
    constructor(geometry?: any) {
      this.geometry = geometry
      this.name = ''
    }
  }
  class MockSkinnedMesh extends MockMesh {
    skeleton: any
  }
  class MockBone {
    name = ''
  }

  return {
    Mesh: MockMesh,
    SkinnedMesh: MockSkinnedMesh,
    Bone: MockBone
  }
}

type MockThree = ReturnType<typeof createMockThree>

function asThree(mock: Record<string, unknown>): ThreeModules {
  return mock as unknown as ThreeModules
}

function createScene(nodes: unknown[]): THREE.Scene {
  return {
    traverse: (callback: (node: unknown) => void) => {
      nodes.forEach(callback)
    }
  } as unknown as THREE.Scene
}

// Builds a buffer attribute backed by a flat array of `itemSize` components per vertex,
// exposing the getX/getY/getZ/getW accessors the helper reads.
function createAttribute(values: number[][], itemSize: number) {
  return {
    count: values.length,
    itemSize,
    getX: (index: number) => values[index][0],
    getY: (index: number) => values[index][1],
    getZ: (index: number) => values[index][2],
    getW: (index: number) => values[index][3]
  }
}

/**
 * Creates a skinned mesh whose vertices are bound to the given bones.
 * Each `vertexBindings` entry is the list of bone indices that vertex is fully bound to,
 * distributing weight equally across those bones.
 */
function createSkinnedMesh(Three: MockThree, boneNames: string[], vertexBindings: number[][]) {
  const bones = boneNames.map(name => {
    const bone = new Three.Bone()
    bone.name = name
    return bone
  })

  const skinIndexValues: number[][] = []
  const skinWeightValues: number[][] = []
  for (const binding of vertexBindings) {
    const index = [0, 0, 0, 0]
    const weight = [0, 0, 0, 0]
    const perBone = 1 / binding.length
    binding.forEach((boneIdx, slot) => {
      index[slot] = boneIdx
      weight[slot] = perBone
    })
    skinIndexValues.push(index)
    skinWeightValues.push(weight)
  }

  const mesh = new Three.SkinnedMesh({
    getAttribute: (name: string) => {
      if (name === 'skinIndex') return createAttribute(skinIndexValues, 4)
      if (name === 'skinWeight') return createAttribute(skinWeightValues, 4)
      return null
    }
  })
  mesh.skeleton = { bones }
  return mesh
}

describe('suggestWearableCategory', () => {
  let Three: MockThree

  beforeEach(() => {
    Three = createMockThree()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when the geometry is dominantly bound to the head bones', () => {
    let result: WearableCategory | null

    beforeEach(() => {
      const mesh = createSkinnedMesh(Three, ['Avatar_Head', 'Avatar_Neck'], [[0], [0], [1]])
      result = suggestWearableCategory(asThree(Three), createScene([mesh]))
    })

    it('should suggest the hat category', () => {
      expect(result).toBe(WearableCategory.HAT)
    })
  })

  describe('when the geometry is dominantly bound to the spine and arm bones', () => {
    let result: WearableCategory | null

    beforeEach(() => {
      const mesh = createSkinnedMesh(Three, ['Avatar_Spine', 'Avatar_LeftArm', 'Avatar_RightArm'], [[0], [1], [2], [0]])
      result = suggestWearableCategory(asThree(Three), createScene([mesh]))
    })

    it('should suggest the upper_body category', () => {
      expect(result).toBe(WearableCategory.UPPER_BODY)
    })
  })

  describe('when the geometry is dominantly bound to the leg bones', () => {
    let result: WearableCategory | null

    beforeEach(() => {
      const mesh = createSkinnedMesh(Three, ['Avatar_LeftUpLeg', 'Avatar_RightUpLeg', 'Avatar_LeftLeg'], [[0], [1], [2], [0]])
      result = suggestWearableCategory(asThree(Three), createScene([mesh]))
    })

    it('should suggest the lower_body category', () => {
      expect(result).toBe(WearableCategory.LOWER_BODY)
    })
  })

  describe('when the geometry is dominantly bound to the foot bones', () => {
    let result: WearableCategory | null

    beforeEach(() => {
      const mesh = createSkinnedMesh(Three, ['Avatar_LeftFoot', 'Avatar_RightFoot', 'Avatar_LeftToeBase'], [[0], [1], [2], [0]])
      result = suggestWearableCategory(asThree(Three), createScene([mesh]))
    })

    it('should suggest the feet category', () => {
      expect(result).toBe(WearableCategory.FEET)
    })
  })

  describe('when the geometry is dominantly bound to the hand bones', () => {
    let result: WearableCategory | null

    beforeEach(() => {
      const mesh = createSkinnedMesh(Three, ['Avatar_LeftHand', 'Avatar_RightHand', 'Avatar_LeftHandIndex'], [[0], [1], [2], [0]])
      result = suggestWearableCategory(asThree(Three), createScene([mesh]))
    })

    it('should suggest the hands_wear category', () => {
      expect(result).toBe(WearableCategory.HANDS_WEAR)
    })
  })

  describe('when the geometry is dominantly bound to the forearm bones', () => {
    let result: WearableCategory | null

    beforeEach(() => {
      // Documents the intended classification: forearm bones belong to the upper body, so
      // sleeved garments (shirts, jackets) suggest `upper_body` (see the `forearm` spine token).
      const mesh = createSkinnedMesh(Three, ['Avatar_LeftForeArm', 'Avatar_RightForeArm'], [[0], [1], [0], [1]])
      result = suggestWearableCategory(asThree(Three), createScene([mesh]))
    })

    it('should suggest the upper_body category', () => {
      expect(result).toBe(WearableCategory.UPPER_BODY)
    })
  })

  describe('when the geometry is split across two skinned meshes whose weights accumulate', () => {
    let result: WearableCategory | null

    beforeEach(() => {
      // Two separate skinned meshes both contribute spine/arm weight. The suggestion must
      // aggregate weights across every skinned mesh in the scene, not look at one in isolation:
      // the second mesh also carries some feet weight, and only the summed spine weight
      // (5 of 6 total) crosses the dominant-region threshold.
      const spineMesh = createSkinnedMesh(Three, ['Avatar_Spine', 'Avatar_LeftArm'], [[0], [1], [0]])
      const armMesh = createSkinnedMesh(Three, ['Avatar_RightArm', 'Avatar_LeftFoot'], [[0], [0], [1]])
      result = suggestWearableCategory(asThree(Three), createScene([spineMesh, armMesh]))
    })

    it('should suggest the upper_body category', () => {
      expect(result).toBe(WearableCategory.UPPER_BODY)
    })
  })

  describe('when the geometry is spread evenly across multiple regions', () => {
    let result: WearableCategory | null

    beforeEach(() => {
      // A full-body skin: weight split across head, spine, legs and feet, no dominant region.
      const mesh = createSkinnedMesh(Three, ['Avatar_Head', 'Avatar_Spine', 'Avatar_LeftUpLeg', 'Avatar_LeftFoot'], [[0], [1], [2], [3]])
      result = suggestWearableCategory(asThree(Three), createScene([mesh]))
    })

    it('should return null', () => {
      expect(result).toBeNull()
    })
  })

  describe('when there are no skinned meshes in the scene', () => {
    let result: WearableCategory | null

    beforeEach(() => {
      const mesh = new Three.Mesh()
      result = suggestWearableCategory(asThree(Three), createScene([mesh]))
    })

    it('should return null', () => {
      expect(result).toBeNull()
    })
  })

  describe('when the skinned mesh has no skin attributes', () => {
    let result: WearableCategory | null

    beforeEach(() => {
      const mesh = new Three.SkinnedMesh({ getAttribute: () => null })
      mesh.skeleton = { bones: [] }
      result = suggestWearableCategory(asThree(Three), createScene([mesh]))
    })

    it('should return null', () => {
      expect(result).toBeNull()
    })
  })

  describe('when none of the bound bones match a known avatar region', () => {
    let result: WearableCategory | null

    beforeEach(() => {
      const mesh = createSkinnedMesh(Three, ['Prop_Root', 'Some_Other_Bone'], [[0], [1]])
      result = suggestWearableCategory(asThree(Three), createScene([mesh]))
    })

    it('should return null', () => {
      expect(result).toBeNull()
    })
  })
})
