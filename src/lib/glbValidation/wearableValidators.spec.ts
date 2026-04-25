import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { WearableCategory } from '@dcl/schemas'
import { ValidationSeverity } from './types'
import type { ValidationIssue } from './types'
import {
  validateTriangleCounts,
  validateDimensions,
  validateMaterials,
  validateTextures,
  validateBoneInfluences,
  validateNoLeafBones,
  validateNoDisallowedObjects,
  validateMaterialNaming,
  validateNoNonDeformBones,
  validateSpringBones
} from './wearableValidators'
import {
  MAX_MATERIALS_DEFAULT,
  MAX_MATERIALS_SKIN,
  MAX_TEXTURES_DEFAULT,
  AVATAR_SKIN_MAT,
  MAX_SPRING_BONES,
  getEffectiveTriangleLimit
} from './constants'

// Mock Three.js classes that support instanceof checks.
function createMockThree() {
  class MockMesh {
    material: any
    geometry: any
    name: string
    constructor(geometry?: any, material?: any) {
      this.geometry = geometry
      this.material = material
      this.name = ''
    }
  }
  class MockBufferGeometry {
    index: { count: number } | null = null
    attributes: Record<string, unknown> = {}
    getAttribute(name: string): unknown {
      return this.attributes[name] ?? null
    }
  }
  class MockGeometry {
    faces: any[] = []
  }
  class MockSkinnedMesh extends MockMesh {}
  class MockBone {
    name: string = ''
  }
  class MockCamera {}
  class MockLight {}
  class MockBox3 {
    min = { x: 0, y: 0, z: 0 }
    max = { x: 0, y: 0, z: 0 }
    setFromObject() {
      return this
    }
    getSize<T>(target: T): T {
      return target
    }
  }
  class MockVector3 {
    x = 0
    y = 0
    z = 0
  }

  return {
    Mesh: MockMesh,
    BufferGeometry: MockBufferGeometry,
    Geometry: MockGeometry,
    SkinnedMesh: MockSkinnedMesh,
    Bone: MockBone,
    Camera: MockCamera,
    Light: MockLight,
    Box3: MockBox3,
    Vector3: MockVector3
  }
}

type MockThree = ReturnType<typeof createMockThree>
type ThreeModules = typeof import('three')

function createScene(nodes: unknown[]): THREE.Scene {
  return {
    traverse: (callback: (node: unknown) => void) => {
      nodes.forEach(callback)
    }
  } as unknown as THREE.Scene
}

function asThree(mock: Record<string, unknown>): ThreeModules {
  return mock as unknown as ThreeModules
}

function asGLTF(obj: { scene: THREE.Scene; animations: unknown[] }): GLTF {
  return obj as unknown as GLTF
}

function createMeshNode(Three: MockThree, opts: { triangles?: number; materialName?: string } = {}) {
  const geom = new Three.BufferGeometry()
  if (opts.triangles) {
    geom.attributes.position = { count: opts.triangles * 3 }
  }
  const mat: any = { name: opts.materialName ?? 'Material' }
  const mesh = new Three.Mesh(geom, mat)
  mesh.material = mat
  mesh.geometry = geom
  return mesh
}

function createMeshWithTexture(Three: MockThree, matName: string, texUuid: string, imgSize: number) {
  const mesh = createMeshNode(Three, { materialName: matName })
  mesh.material.map = { uuid: texUuid, name: 'tex', image: { width: imgSize, height: imgSize } }
  mesh.material.emissiveMap = null
  mesh.material.alphaMap = null
  mesh.material.aoMap = null
  mesh.material.normalMap = null
  mesh.material.roughnessMap = null
  mesh.material.metalnessMap = null
  return mesh
}

describe('validateTriangleCounts', () => {
  let Three: MockThree

  beforeEach(() => {
    Three = createMockThree()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when a category is provided', () => {
    describe('and the triangle count is within the category limit', () => {
      let issues: ValidationIssue[]

      beforeEach(() => {
        const scene = createScene([createMeshNode(Three, { triangles: 400 })])
        issues = validateTriangleCounts(asThree(Three), scene, WearableCategory.MASK)
      })

      it('should return no issues', () => {
        expect(issues).toEqual([])
      })
    })

    describe('and the triangle count exceeds the category limit', () => {
      let issues: ValidationIssue[]

      beforeEach(() => {
        const scene = createScene([createMeshNode(Three, { triangles: 600 })])
        issues = validateTriangleCounts(asThree(Three), scene, WearableCategory.MASK)
      })

      it('should return an error with the TRIANGLE_COUNT_EXCEEDED code', () => {
        expect(issues).toHaveLength(1)
        expect(issues[0].code).toBe('TRIANGLE_COUNT_EXCEEDED')
        expect(issues[0].severity).toBe(ValidationSeverity.WARNING)
      })

      it('should include the actual count and limit in the params', () => {
        expect(issues[0].messageParams?.count).toBe(600)
        expect(issues[0].messageParams?.limit).toBe(500)
      })
    })

    describe('and the category is skin with a higher limit', () => {
      let issues: ValidationIssue[]

      beforeEach(() => {
        const scene = createScene([createMeshNode(Three, { triangles: 4000 })])
        issues = validateTriangleCounts(asThree(Three), scene, WearableCategory.SKIN)
      })

      it('should return no issues', () => {
        expect(issues).toEqual([])
      })
    })
  })

  describe('when no category is provided', () => {
    describe('and the triangle count exceeds the standard limit', () => {
      let issues: ValidationIssue[]

      beforeEach(() => {
        const scene = createScene([createMeshNode(Three, { triangles: 2000 })])
        issues = validateTriangleCounts(asThree(Three), scene)
      })

      it('should return no issues (triangle check is skipped without category)', () => {
        expect(issues).toEqual([])
      })
    })
  })

  describe('when multiple meshes are present', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const scene = createScene([createMeshNode(Three, { triangles: 300 }), createMeshNode(Three, { triangles: 300 })])
      issues = validateTriangleCounts(asThree(Three), scene, WearableCategory.MASK)
    })

    it('should sum the triangles and report the total', () => {
      expect(issues).toHaveLength(1)
      expect(issues[0].messageParams?.count).toBe(600)
    })
  })
})

describe('validateDimensions', () => {
  let Three: MockThree

  beforeEach(() => {
    Three = createMockThree()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when dimensions are within limits', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const mockThree = {
        ...Three,
        Box3: class {
          setFromObject() {
            return this
          }
          getSize(target: { x: number; y: number; z: number }) {
            target.x = 1.0
            target.y = 2.0
            target.z = 1.0
            return target
          }
        },
        Vector3: class {
          x = 0
          y = 0
          z = 0
        }
      }
      issues = validateDimensions(asThree(mockThree), createScene([]))
    })

    it('should return no issues', () => {
      expect(issues).toEqual([])
    })
  })

  describe('when dimensions exceed limits', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const mockThree = {
        ...Three,
        Box3: class {
          setFromObject() {
            return this
          }
          getSize(target: { x: number; y: number; z: number }) {
            target.x = 3.0
            target.y = 3.0
            target.z = 2.0
            return target
          }
        },
        Vector3: class {
          x = 0
          y = 0
          z = 0
        }
      }
      issues = validateDimensions(asThree(mockThree), createScene([]))
    })

    it('should return an error with the DIMENSIONS_EXCEEDED code', () => {
      expect(issues).toHaveLength(1)
      expect(issues[0].code).toBe('DIMENSIONS_EXCEEDED')
      expect(issues[0].severity).toBe(ValidationSeverity.WARNING)
    })
  })
})

describe('validateMaterials', () => {
  let Three: MockThree

  beforeEach(() => {
    Three = createMockThree()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when the material count is within the default limit', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const scene = createScene([createMeshNode(Three, { materialName: 'Mat1' }), createMeshNode(Three, { materialName: 'Mat2' })])
      issues = validateMaterials(asThree(Three), scene)
    })

    it('should return no issues', () => {
      expect(issues).toEqual([])
    })
  })

  describe('when the material count exceeds the default limit', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const nodes = Array.from({ length: MAX_MATERIALS_DEFAULT + 1 }, (_, i) => createMeshNode(Three, { materialName: `Mat${i}` }))
      issues = validateMaterials(asThree(Three), createScene(nodes))
    })

    it('should return an error with the MATERIALS_EXCEEDED code', () => {
      expect(issues).toHaveLength(1)
      expect(issues[0].code).toBe('MATERIALS_EXCEEDED')
      expect(issues[0].severity).toBe(ValidationSeverity.WARNING)
    })
  })

  describe('when AvatarSkin_MAT is used', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const scene = createScene([
        createMeshNode(Three, { materialName: 'Mat1' }),
        createMeshNode(Three, { materialName: 'Mat2' }),
        createMeshNode(Three, { materialName: AVATAR_SKIN_MAT })
      ])
      issues = validateMaterials(asThree(Three), scene)
    })

    it('should exclude it from the count', () => {
      expect(issues).toEqual([])
    })
  })

  describe('when the category is skin', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const nodes = Array.from({ length: MAX_MATERIALS_SKIN }, (_, i) => createMeshNode(Three, { materialName: `Mat${i}` }))
      issues = validateMaterials(asThree(Three), createScene(nodes), WearableCategory.SKIN)
    })

    it('should use the higher skin limit', () => {
      expect(issues).toEqual([])
    })
  })
})

describe('validateTextures', () => {
  let Three: MockThree

  beforeEach(() => {
    Three = createMockThree()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when texture count and resolution are within limits', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const scene = createScene([createMeshWithTexture(Three, 'Mat1', 'tex1', 512), createMeshWithTexture(Three, 'Mat2', 'tex2', 256)])
      issues = validateTextures(asThree(Three), scene)
    })

    it('should return no issues', () => {
      expect(issues).toEqual([])
    })
  })

  describe('when the texture count exceeds the limit', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const nodes = Array.from({ length: MAX_TEXTURES_DEFAULT + 1 }, (_, i) => createMeshWithTexture(Three, `Mat${i}`, `tex${i}`, 256))
      issues = validateTextures(asThree(Three), createScene(nodes))
    })

    it('should include a TEXTURES_EXCEEDED error', () => {
      expect(issues.some(i => i.code === 'TEXTURES_EXCEEDED')).toBe(true)
    })
  })

  describe('when the material is AvatarSkin_MAT', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      issues = validateTextures(asThree(Three), createScene([createMeshWithTexture(Three, AVATAR_SKIN_MAT, 'tex1', 2048)]))
    })

    it('should skip its textures entirely', () => {
      expect(issues).toEqual([])
    })
  })
})

describe('validateBoneInfluences', () => {
  let Three: MockThree

  beforeEach(() => {
    Three = createMockThree()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when skinWeight itemSize is 4 or less', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const mesh = new Three.SkinnedMesh()
      const geom = new Three.BufferGeometry()
      geom.attributes.skinWeight = { itemSize: 4 }
      mesh.geometry = geom
      issues = validateBoneInfluences(asThree(Three), createScene([mesh]))
    })

    it('should return no issues', () => {
      expect(issues).toEqual([])
    })
  })

  describe('when skinWeight itemSize exceeds 4', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const mesh = new Three.SkinnedMesh()
      const geom = new Three.BufferGeometry()
      geom.attributes.skinWeight = { itemSize: 8 }
      mesh.geometry = geom
      issues = validateBoneInfluences(asThree(Three), createScene([mesh]))
    })

    it('should return an error with the BONE_INFLUENCES_EXCEEDED code', () => {
      expect(issues).toHaveLength(1)
      expect(issues[0].code).toBe('BONE_INFLUENCES_EXCEEDED')
    })
  })
})

describe('validateNoLeafBones', () => {
  let Three: MockThree

  beforeEach(() => {
    Three = createMockThree()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when there are no leaf bones', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const bone = new Three.Bone()
      bone.name = 'Hips'
      issues = validateNoLeafBones(asThree(Three), createScene([bone]))
    })

    it('should return no issues', () => {
      expect(issues).toEqual([])
    })
  })

  describe('when a bone with _end suffix is present', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const bone = new Three.Bone()
      bone.name = 'Head_end'
      issues = validateNoLeafBones(asThree(Three), createScene([bone]))
    })

    it('should return a warning with the LEAF_BONES_FOUND code', () => {
      expect(issues).toHaveLength(1)
      expect(issues[0].code).toBe('LEAF_BONES_FOUND')
      expect(issues[0].severity).toBe(ValidationSeverity.WARNING)
    })
  })

  describe('when a bone with _neutral suffix is present', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const bone = new Three.Bone()
      bone.name = 'Spine_neutral'
      issues = validateNoLeafBones(asThree(Three), createScene([bone]))
    })

    it('should return a warning', () => {
      expect(issues).toHaveLength(1)
      expect(issues[0].code).toBe('LEAF_BONES_FOUND')
    })
  })
})

describe('validateNoNonDeformBones', () => {
  let Three: MockThree

  beforeEach(() => {
    Three = createMockThree()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when all bones are bound to a skinned mesh', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const bone1 = new Three.Bone()
      bone1.name = 'Hips'
      const bone2 = new Three.Bone()
      bone2.name = 'Spine'
      const skinnedMesh = new Three.SkinnedMesh()
      ;(skinnedMesh as any).skeleton = { bones: [bone1, bone2] }
      issues = validateNoNonDeformBones(asThree(Three), createScene([bone1, bone2, skinnedMesh]))
    })

    it('should return no issues', () => {
      expect(issues).toEqual([])
    })
  })

  describe('when there are bones not bound to any skinned mesh', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const deformBone = new Three.Bone()
      deformBone.name = 'Hips'
      const controlBone = new Three.Bone()
      controlBone.name = 'CTRL_IK_Foot'
      const skinnedMesh = new Three.SkinnedMesh()
      ;(skinnedMesh as any).skeleton = { bones: [deformBone] }
      issues = validateNoNonDeformBones(asThree(Three), createScene([deformBone, controlBone, skinnedMesh]))
    })

    it('should return a warning with the NON_DEFORM_BONES_FOUND code', () => {
      expect(issues).toHaveLength(1)
      expect(issues[0].code).toBe('NON_DEFORM_BONES_FOUND')
      expect(issues[0].severity).toBe(ValidationSeverity.WARNING)
    })

    it('should report the count and bone names', () => {
      expect(issues[0].messageParams?.count).toBe(1)
      expect(issues[0].messageParams?.bones).toContain('CTRL_IK_Foot')
    })
  })

  describe('when there are no skinned meshes at all', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const bone = new Three.Bone()
      bone.name = 'OrphanBone'
      issues = validateNoNonDeformBones(asThree(Three), createScene([bone]))
    })

    it('should report all bones as non-deformation', () => {
      expect(issues).toHaveLength(1)
      expect(issues[0].messageParams?.count).toBe(1)
    })
  })

  describe('when there are no bones at all', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      issues = validateNoNonDeformBones(asThree(Three), createScene([]))
    })

    it('should return no issues', () => {
      expect(issues).toEqual([])
    })
  })
})

describe('validateNoDisallowedObjects', () => {
  let Three: MockThree

  beforeEach(() => {
    Three = createMockThree()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when the scene is clean and has no animations', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      issues = validateNoDisallowedObjects(asThree(Three), asGLTF({ scene: createScene([]), animations: [] }))
    })

    it('should return no issues', () => {
      expect(issues).toEqual([])
    })
  })

  describe('when cameras are present', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      issues = validateNoDisallowedObjects(asThree(Three), asGLTF({ scene: createScene([new Three.Camera()]), animations: [] }))
    })

    it('should return an error with the CAMERAS_FOUND code', () => {
      expect(issues.some(i => i.code === 'CAMERAS_FOUND')).toBe(true)
    })
  })

  describe('when lights are present', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      issues = validateNoDisallowedObjects(asThree(Three), asGLTF({ scene: createScene([new Three.Light()]), animations: [] }))
    })

    it('should return an error with the LIGHTS_FOUND code', () => {
      expect(issues.some(i => i.code === 'LIGHTS_FOUND')).toBe(true)
    })
  })

  describe('when animations are present in a wearable', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      issues = validateNoDisallowedObjects(asThree(Three), asGLTF({ scene: createScene([]), animations: [{ name: 'idle' }] }))
    })

    it('should return an error with the ANIMATIONS_IN_WEARABLE code', () => {
      expect(issues.some(i => i.code === 'ANIMATIONS_IN_WEARABLE')).toBe(true)
    })
  })

  describe('when cameras, lights, and animations are all present', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const gltf = asGLTF({
        scene: createScene([new Three.Camera(), new Three.Light()]),
        animations: [{ name: 'anim' }]
      })
      issues = validateNoDisallowedObjects(asThree(Three), gltf)
    })

    it('should return three errors', () => {
      expect(issues).toHaveLength(3)
    })
  })
})

describe('validateMaterialNaming', () => {
  let Three: MockThree

  beforeEach(() => {
    Three = createMockThree()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when no forbidden patterns are found', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      issues = validateMaterialNaming(asThree(Three), createScene([createMeshNode(Three, { materialName: 'Body_MAT' })]))
    })

    it('should return no issues', () => {
      expect(issues).toEqual([])
    })
  })

  describe('when a material uses a forbidden pattern', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      issues = validateMaterialNaming(asThree(Three), createScene([createMeshNode(Three, { materialName: 'head_eyes_MAT' })]))
    })

    it('should return a warning with the FORBIDDEN_MATERIAL_NAME code', () => {
      expect(issues).toHaveLength(1)
      expect(issues[0].code).toBe('FORBIDDEN_MATERIAL_NAME')
      expect(issues[0].severity).toBe(ValidationSeverity.WARNING)
    })
  })

  describe('when the category is a facial category', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      issues = validateMaterialNaming(
        asThree(Three),
        createScene([createMeshNode(Three, { materialName: 'head_eyes_MAT' })]),
        WearableCategory.EYES
      )
    })

    it('should skip the check entirely', () => {
      expect(issues).toEqual([])
    })
  })

  describe('when multiple materials use forbidden patterns', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      issues = validateMaterialNaming(
        asThree(Three),
        createScene([
          createMeshNode(Three, { materialName: 'face_eyebrows_mat' }),
          createMeshNode(Three, { materialName: 'face_mouth_mat' })
        ])
      )
    })

    it('should return a warning for each forbidden material', () => {
      expect(issues).toHaveLength(2)
    })
  })
})

describe('validateSpringBones', () => {
  function gltfWithNodeNames(names: string[]): GLTF {
    return { parser: { json: { nodes: names.map(name => ({ name })) } } } as unknown as GLTF
  }

  describe('when the spring bone count is at the limit', () => {
    it('should return no issues', () => {
      const gltf = gltfWithNodeNames(Array.from({ length: MAX_SPRING_BONES }, (_, i) => `Hair.springbone.${i}`))
      expect(validateSpringBones(gltf)).toEqual([])
    })
  })

  describe('when the spring bone count exceeds the limit', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const gltf = gltfWithNodeNames(Array.from({ length: MAX_SPRING_BONES + 1 }, (_, i) => `Hair.springbone.${i}`))
      issues = validateSpringBones(gltf)
    })

    it('should return a warning with the SPRING_BONE_COUNT_EXCEEDED code', () => {
      expect(issues).toHaveLength(1)
      expect(issues[0].code).toBe('SPRING_BONE_COUNT_EXCEEDED')
      expect(issues[0].severity).toBe(ValidationSeverity.WARNING)
      expect(issues[0].messageParams).toEqual({ count: MAX_SPRING_BONES + 1, limit: MAX_SPRING_BONES })
    })
  })

  describe('when no nodes are spring bones', () => {
    it('should return no issues', () => {
      expect(validateSpringBones(gltfWithNodeNames(['Armature', 'Head']))).toEqual([])
    })
  })

  describe('when spring bone names use different casings', () => {
    it('should count them case-insensitively', () => {
      const gltf = gltfWithNodeNames(['Hair.SpringBone.000', 'SPRINGBONE_tail', 'NotABone'])
      expect(validateSpringBones(gltf)).toEqual([])
    })
  })

  describe('when gltf.parser is unavailable', () => {
    it('should return no issues', () => {
      expect(validateSpringBones({} as unknown as GLTF)).toEqual([])
    })
  })
})

// --- Edge case tests ---

describe('edge cases', () => {
  let Three: MockThree

  beforeEach(() => {
    Three = createMockThree()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when the scene has no meshes at all', () => {
    describe('and validateTriangleCounts is called', () => {
      let issues: ValidationIssue[]

      beforeEach(() => {
        issues = validateTriangleCounts(asThree(Three), createScene([]))
      })

      it('should return no issues', () => {
        expect(issues).toEqual([])
      })
    })

    describe('and validateMaterials is called', () => {
      let issues: ValidationIssue[]

      beforeEach(() => {
        issues = validateMaterials(asThree(Three), createScene([]))
      })

      it('should return no issues', () => {
        expect(issues).toEqual([])
      })
    })

    describe('and validateTextures is called', () => {
      let issues: ValidationIssue[]

      beforeEach(() => {
        issues = validateTextures(asThree(Three), createScene([]))
      })

      it('should return no issues', () => {
        expect(issues).toEqual([])
      })
    })

    describe('and validateBoneInfluences is called', () => {
      let issues: ValidationIssue[]

      beforeEach(() => {
        issues = validateBoneInfluences(asThree(Three), createScene([]))
      })

      it('should return no issues', () => {
        expect(issues).toEqual([])
      })
    })

    describe('and validateNoLeafBones is called', () => {
      let issues: ValidationIssue[]

      beforeEach(() => {
        issues = validateNoLeafBones(asThree(Three), createScene([]))
      })

      it('should return no issues', () => {
        expect(issues).toEqual([])
      })
    })

    describe('and validateMaterialNaming is called', () => {
      let issues: ValidationIssue[]

      beforeEach(() => {
        issues = validateMaterialNaming(asThree(Three), createScene([]))
      })

      it('should return no issues', () => {
        expect(issues).toEqual([])
      })
    })
  })

  describe('when the scene only has AvatarSkin_MAT materials', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const scene = createScene([createMeshNode(Three, { materialName: AVATAR_SKIN_MAT })])
      issues = validateMaterials(asThree(Three), scene)
    })

    it('should count zero materials', () => {
      expect(issues).toEqual([])
    })
  })

  describe('when a mesh uses indexed geometry', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const geom = new Three.BufferGeometry()
      geom.index = { count: 900 } // 300 triangles
      const mesh = new Three.Mesh(geom, { name: 'Mat' })
      mesh.material = { name: 'Mat' }
      mesh.geometry = geom
      issues = validateTriangleCounts(asThree(Three), createScene([mesh]), WearableCategory.MASK)
    })

    it('should count triangles from index.count / 3', () => {
      expect(issues).toEqual([])
    })
  })

  describe('when a mesh uses indexed geometry that exceeds the limit', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const geom = new Three.BufferGeometry()
      geom.index = { count: 1800 } // 600 triangles
      const mesh = new Three.Mesh(geom, { name: 'Mat' })
      mesh.material = { name: 'Mat' }
      mesh.geometry = geom
      issues = validateTriangleCounts(asThree(Three), createScene([mesh]), WearableCategory.MASK)
    })

    it('should report the correct triangle count', () => {
      expect(issues).toHaveLength(1)
      expect(issues[0].messageParams?.count).toBe(600)
    })
  })
})

describe('getEffectiveTriangleLimit', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when no hides are provided', () => {
    let limit: number

    beforeEach(() => {
      limit = getEffectiveTriangleLimit(WearableCategory.UPPER_BODY)
    })

    it('should return the base category limit', () => {
      expect(limit).toBe(1500)
    })
  })

  describe('when hides is an empty array', () => {
    let limit: number

    beforeEach(() => {
      limit = getEffectiveTriangleLimit(WearableCategory.UPPER_BODY, [])
    })

    it('should return the base category limit', () => {
      expect(limit).toBe(1500)
    })
  })

  describe('when a jumpsuit hides lower_body', () => {
    let limit: number

    beforeEach(() => {
      limit = getEffectiveTriangleLimit(WearableCategory.UPPER_BODY, [WearableCategory.LOWER_BODY])
    })

    it('should combine the budgets (1500 + 1500 = 3000)', () => {
      expect(limit).toBe(3000)
    })
  })

  describe('when a helmet hides hair and hat', () => {
    let limit: number

    beforeEach(() => {
      limit = getEffectiveTriangleLimit(WearableCategory.HELMET, [WearableCategory.HAIR, WearableCategory.HAT])
    })

    it('should combine all budgets (1500 + 1500 + 1500 = 4500)', () => {
      expect(limit).toBe(1500 + 1500 + 1500)
    })
  })

  describe('when an upper_body hides multiple small categories', () => {
    let limit: number

    beforeEach(() => {
      limit = getEffectiveTriangleLimit(WearableCategory.UPPER_BODY, [WearableCategory.MASK, WearableCategory.EYEWEAR])
    })

    it('should add each hidden budget (1500 + 500 + 500 = 2500)', () => {
      expect(limit).toBe(2500)
    })
  })

  describe('when hides includes a category without a triangle budget', () => {
    let limit: number

    beforeEach(() => {
      limit = getEffectiveTriangleLimit(WearableCategory.UPPER_BODY, ['head' as WearableCategory])
    })

    it('should ignore the unknown category and return only the base limit', () => {
      expect(limit).toBe(1500)
    })
  })
})

describe('validateTriangleCounts with Tris Combiner', () => {
  let Three: MockThree

  beforeEach(() => {
    Three = createMockThree()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when a jumpsuit has 2500 tris and hides lower_body', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const scene = createScene([createMeshNode(Three, { triangles: 2500 })])
      issues = validateTriangleCounts(asThree(Three), scene, WearableCategory.UPPER_BODY, [WearableCategory.LOWER_BODY])
    })

    it('should return no issues (combined limit is 3000)', () => {
      expect(issues).toEqual([])
    })
  })

  describe('when a jumpsuit has 3500 tris and hides lower_body', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const scene = createScene([createMeshNode(Three, { triangles: 3500 })])
      issues = validateTriangleCounts(asThree(Three), scene, WearableCategory.UPPER_BODY, [WearableCategory.LOWER_BODY])
    })

    it('should return an error with the combined limit of 3000', () => {
      expect(issues).toHaveLength(1)
      expect(issues[0].code).toBe('TRIANGLE_COUNT_EXCEEDED')
      expect(issues[0].messageParams?.limit).toBe(3000)
    })
  })

  describe('when a helmet has 4000 tris and hides hair and hat', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const scene = createScene([createMeshNode(Three, { triangles: 4000 })])
      issues = validateTriangleCounts(asThree(Three), scene, WearableCategory.HELMET, [WearableCategory.HAIR, WearableCategory.HAT])
    })

    it('should return no issues (combined limit is 1500 + 1500 + 1500 = 4500)', () => {
      expect(issues).toEqual([])
    })
  })

  describe('when a helmet has 5000 tris and hides hair and hat', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const scene = createScene([createMeshNode(Three, { triangles: 5000 })])
      issues = validateTriangleCounts(asThree(Three), scene, WearableCategory.HELMET, [WearableCategory.HAIR, WearableCategory.HAT])
    })

    it('should return an error with the combined limit of 4500', () => {
      expect(issues).toHaveLength(1)
      expect(issues[0].messageParams?.limit).toBe(4500)
    })
  })
})
