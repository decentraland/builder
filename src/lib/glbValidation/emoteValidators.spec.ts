import type { AnimationClip, Scene } from 'three'
import { ValidationSeverity } from './types'
import type { ValidationIssue } from './types'
import {
  validateEmoteFrameRate,
  validateEmoteMaxFrames,
  validateEmoteAnimationClipCount,
  validateEmoteDisplacement,
  validateEmoteDeformBoneKeyframes,
  validatePropTriangles,
  validatePropMaterials,
  validatePropTextures,
  validatePropArmatureBones,
  validateArmatureNaming,
  validateAnimationNaming,
  validateAudioFormat
} from './emoteValidators'
import {
  EMOTE_EXPECTED_FPS,
  EMOTE_MAX_FRAMES,
  EMOTE_MAX_ANIMATION_CLIPS_BASIC,
  EMOTE_MAX_ANIMATION_CLIPS_WITH_PROPS,
  EMOTE_MAX_DISPLACEMENT_METERS,
  PROP_MAX_TRIANGLES,
  PROP_MAX_MATERIALS,
  PROP_MAX_TEXTURES,
  PROP_MAX_ARMATURE_BONES,
  PROP_ARMATURE_NAME
} from './constants'

function makeAnimation(opts: { duration: number; trackFrames?: number; trackName?: string; trackValues?: number[] }): AnimationClip {
  const frames = opts.trackFrames ?? 30
  const times = Array.from({ length: frames }, (_, i) => i * (opts.duration / frames))
  return {
    name: opts.trackName ?? 'Animation',
    duration: opts.duration,
    tracks: [
      {
        name: opts.trackName ?? 'Hips.position',
        times,
        values: opts.trackValues ?? times.flatMap(() => [0, 0, 0])
      }
    ]
  } as unknown as AnimationClip
}

function makeClip(name: string): AnimationClip {
  return { name, duration: 1, tracks: [] } as unknown as AnimationClip
}

function makeScene(childNames: string[]): Scene {
  return { children: childNames.map(name => ({ name })) } as unknown as Scene
}

describe('validateEmoteFrameRate', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when animations are empty', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      issues = validateEmoteFrameRate([])
    })

    it('should return no issues', () => {
      expect(issues).toEqual([])
    })
  })

  describe('when the fps is within tolerance of the expected rate', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const anim = makeAnimation({ duration: 1, trackFrames: EMOTE_EXPECTED_FPS })
      issues = validateEmoteFrameRate([anim])
    })

    it('should return no issues', () => {
      expect(issues).toEqual([])
    })
  })

  describe('when the fps deviates beyond the tolerance', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const anim = makeAnimation({ duration: 1, trackFrames: 10 })
      issues = validateEmoteFrameRate([anim])
    })

    it('should return a single warning', () => {
      expect(issues).toHaveLength(1)
      expect(issues[0].severity).toBe(ValidationSeverity.WARNING)
    })

    it('should report the EMOTE_FRAME_RATE code', () => {
      expect(issues[0].code).toBe('EMOTE_FRAME_RATE')
    })
  })

  describe('when the animation has zero duration', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const anim = makeAnimation({ duration: 0, trackFrames: 30 })
      issues = validateEmoteFrameRate([anim])
    })

    it('should return no issues', () => {
      expect(issues).toEqual([])
    })
  })
})

describe('validateEmoteMaxFrames', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when animations are empty', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      issues = validateEmoteMaxFrames([])
    })

    it('should return no issues', () => {
      expect(issues).toEqual([])
    })
  })

  describe('when the frame count is within the limit', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const anim = makeAnimation({ duration: 10, trackFrames: EMOTE_MAX_FRAMES })
      issues = validateEmoteMaxFrames([anim])
    })

    it('should return no issues', () => {
      expect(issues).toEqual([])
    })
  })

  describe('when the frame count exceeds the limit', () => {
    let issues: ValidationIssue[]
    let exceededCount: number

    beforeEach(() => {
      exceededCount = EMOTE_MAX_FRAMES + 1
      const anim = makeAnimation({ duration: 11, trackFrames: exceededCount })
      issues = validateEmoteMaxFrames([anim])
    })

    it('should return an error', () => {
      expect(issues).toHaveLength(1)
      expect(issues[0].severity).toBe(ValidationSeverity.WARNING)
    })

    it('should report the actual frame count in the params', () => {
      expect(issues[0].messageParams?.frames).toBe(exceededCount)
    })
  })
})

describe('validateEmoteAnimationClipCount', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when hasProps is false', () => {
    describe('and the clip count is within the basic limit', () => {
      let issues: ValidationIssue[]

      beforeEach(() => {
        const anims = Array.from({ length: EMOTE_MAX_ANIMATION_CLIPS_BASIC }, () => makeAnimation({ duration: 1 }))
        issues = validateEmoteAnimationClipCount(anims, false)
      })

      it('should return no issues', () => {
        expect(issues).toEqual([])
      })
    })

    describe('and the clip count exceeds the basic limit', () => {
      let issues: ValidationIssue[]

      beforeEach(() => {
        const anims = Array.from({ length: EMOTE_MAX_ANIMATION_CLIPS_BASIC + 1 }, () => makeAnimation({ duration: 1 }))
        issues = validateEmoteAnimationClipCount(anims, false)
      })

      it('should return an error with the EMOTE_MAX_CLIPS code', () => {
        expect(issues).toHaveLength(1)
        expect(issues[0].code).toBe('EMOTE_MAX_CLIPS')
        expect(issues[0].severity).toBe(ValidationSeverity.WARNING)
      })
    })
  })

  describe('when hasProps is true', () => {
    describe('and the clip count is within the props limit', () => {
      let issues: ValidationIssue[]

      beforeEach(() => {
        const anims = Array.from({ length: EMOTE_MAX_ANIMATION_CLIPS_WITH_PROPS }, () => makeAnimation({ duration: 1 }))
        issues = validateEmoteAnimationClipCount(anims, true)
      })

      it('should return no issues', () => {
        expect(issues).toEqual([])
      })
    })

    describe('and the clip count exceeds the props limit', () => {
      let issues: ValidationIssue[]

      beforeEach(() => {
        const anims = Array.from({ length: EMOTE_MAX_ANIMATION_CLIPS_WITH_PROPS + 1 }, () => makeAnimation({ duration: 1 }))
        issues = validateEmoteAnimationClipCount(anims, true)
      })

      it('should return an error', () => {
        expect(issues).toHaveLength(1)
        expect(issues[0].code).toBe('EMOTE_MAX_CLIPS')
      })
    })
  })
})

describe('validateEmoteDisplacement', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when animations are empty', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      issues = validateEmoteDisplacement([])
    })

    it('should return no issues', () => {
      expect(issues).toEqual([])
    })
  })

  describe('when the Hips displacement is within the limit', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const anim = makeAnimation({
        duration: 1,
        trackFrames: 3,
        trackName: 'Hips.position',
        trackValues: [0, 0, 0, 0.5, 0, 0, 0, 0, 0]
      })
      issues = validateEmoteDisplacement([anim])
    })

    it('should return no issues', () => {
      expect(issues).toEqual([])
    })
  })

  describe('when the Hips displacement exceeds the limit', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const bigDisplacement = EMOTE_MAX_DISPLACEMENT_METERS + 1
      const anim = makeAnimation({
        duration: 1,
        trackFrames: 2,
        trackName: 'Hips.position',
        trackValues: [0, 0, 0, bigDisplacement, 0, 0]
      })
      issues = validateEmoteDisplacement([anim])
    })

    it('should return an error with the EMOTE_DISPLACEMENT code', () => {
      expect(issues).toHaveLength(1)
      expect(issues[0].code).toBe('EMOTE_DISPLACEMENT')
      expect(issues[0].severity).toBe(ValidationSeverity.WARNING)
    })
  })

  describe('when the track does not match the Hips bone', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const anim = makeAnimation({
        duration: 1,
        trackFrames: 2,
        trackName: 'LeftFoot.position',
        trackValues: [0, 0, 0, 100, 0, 0]
      })
      issues = validateEmoteDisplacement([anim])
    })

    it('should return no issues', () => {
      expect(issues).toEqual([])
    })
  })
})

describe('validateArmatureNaming', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when no armatures are present', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      issues = validateArmatureNaming(makeScene(['Mesh', 'Light']))
    })

    it('should return no issues', () => {
      expect(issues).toEqual([])
    })
  })

  describe('when all armature names are valid', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      issues = validateArmatureNaming(makeScene(['Armature', 'Armature_Prop']))
    })

    it('should return no issues', () => {
      expect(issues).toEqual([])
    })
  })

  describe('when Armature_Other is present for social emotes', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      issues = validateArmatureNaming(makeScene(['Armature', 'Armature_Other']))
    })

    it('should return no issues', () => {
      expect(issues).toEqual([])
    })
  })

  describe('when an invalid armature name is present', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      issues = validateArmatureNaming(makeScene(['Armature', 'Armature_Custom']))
    })

    it('should return a warning with the ARMATURE_NAMING code', () => {
      expect(issues).toHaveLength(1)
      expect(issues[0].code).toBe('ARMATURE_NAMING')
      expect(issues[0].severity).toBe(ValidationSeverity.WARNING)
    })

    it('should include the invalid name in the params', () => {
      expect(issues[0].messageParams?.names).toBe('Armature_Custom')
    })
  })
})

describe('validateAnimationNaming', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when hasProps is false', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      issues = validateAnimationNaming([makeClip('Walk')], false)
    })

    it('should return no issues regardless of clip names', () => {
      expect(issues).toEqual([])
    })
  })

  describe('when hasProps is true', () => {
    describe('and there are fewer than 2 clips', () => {
      let issues: ValidationIssue[]

      beforeEach(() => {
        issues = validateAnimationNaming([makeClip('Walk')], true)
      })

      it('should return no issues', () => {
        expect(issues).toEqual([])
      })
    })

    describe('and all clips follow the naming convention', () => {
      let issues: ValidationIssue[]

      beforeEach(() => {
        issues = validateAnimationNaming([makeClip('Dance_Avatar'), makeClip('Dance_Prop')], true)
      })

      it('should return no issues', () => {
        expect(issues).toEqual([])
      })
    })

    describe('and a clip does not follow the naming convention', () => {
      let issues: ValidationIssue[]

      beforeEach(() => {
        issues = validateAnimationNaming([makeClip('Dance_Avatar'), makeClip('Dance')], true)
      })

      it('should return a warning with the ANIMATION_NAMING code', () => {
        expect(issues).toHaveLength(1)
        expect(issues[0].code).toBe('ANIMATION_NAMING')
        expect(issues[0].severity).toBe(ValidationSeverity.WARNING)
      })

      it('should include the invalid clip name in the params', () => {
        expect(issues[0].messageParams?.names).toBe('Dance')
      })
    })
  })
})

describe('validateAudioFormat', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when there are no audio files in contents', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      issues = validateAudioFormat({ 'model.glb': new Blob() })
    })

    it('should return no issues', () => {
      expect(issues).toEqual([])
    })
  })

  describe('when all audio files have valid formats', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      issues = validateAudioFormat({ 'sound.mp3': new Blob(), 'effect.ogg': new Blob() })
    })

    it('should return no issues', () => {
      expect(issues).toEqual([])
    })
  })

  describe('when a .wav file is present', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      issues = validateAudioFormat({ 'sound.wav': new Blob() })
    })

    it('should return an error with the AUDIO_FORMAT code', () => {
      expect(issues).toHaveLength(1)
      expect(issues[0].code).toBe('AUDIO_FORMAT')
      expect(issues[0].severity).toBe(ValidationSeverity.WARNING)
    })

    it('should include the file name in the params', () => {
      expect(issues[0].messageParams?.name).toBe('sound.wav')
    })
  })

  describe('when a .aac file is present', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      issues = validateAudioFormat({ 'sound.aac': new Blob() })
    })

    it('should return an error with the AUDIO_FORMAT code', () => {
      expect(issues).toHaveLength(1)
      expect(issues[0].code).toBe('AUDIO_FORMAT')
    })
  })

  describe('when both valid and invalid audio files are present', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      issues = validateAudioFormat({
        'good.mp3': new Blob(),
        'bad.wav': new Blob(),
        'also_good.ogg': new Blob()
      })
    })

    it('should only report the invalid file', () => {
      expect(issues).toHaveLength(1)
      expect(issues[0].messageParams?.name).toBe('bad.wav')
    })
  })
})

// --- Mock Three.js classes for validators that need them ---

function createMockThree() {
  class MockBufferGeometry {
    index: { count: number } | null = null
    attributes: Record<string, unknown> = {}
    getAttribute(name: string): unknown {
      return this.attributes[name] ?? null
    }
  }
  class MockMesh {
    material: { name: string; [key: string]: unknown } | null
    geometry: MockBufferGeometry
    name: string
    constructor() {
      this.material = null
      this.geometry = new MockBufferGeometry()
      this.name = ''
    }
  }
  class MockBone {
    name: string = ''
  }
  return {
    Mesh: MockMesh,
    Bone: MockBone,
    BufferGeometry: MockBufferGeometry,
    Geometry: class {
      faces: unknown[] = []
    }
  }
}

type MockThree = ReturnType<typeof createMockThree>
type ThreeModules = typeof import('three')

function asThree(mock: Record<string, unknown>): ThreeModules {
  return mock as unknown as ThreeModules
}

function createTraversableScene(nodes: unknown[]): Scene {
  return {
    traverse: (cb: (node: unknown) => void) => nodes.forEach(cb),
    children: []
  } as unknown as Scene
}

function createPropScene(_Three: MockThree, propChildren: unknown[]): Scene {
  return {
    children: [
      {
        name: PROP_ARMATURE_NAME,
        traverse: (cb: (node: unknown) => void) => propChildren.forEach(cb)
      }
    ],
    traverse: (cb: (node: unknown) => void) => propChildren.forEach(cb)
  } as unknown as Scene
}

describe('validateEmoteDeformBoneKeyframes', () => {
  let Three: MockThree

  beforeEach(() => {
    Three = createMockThree()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when animations are empty', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      issues = validateEmoteDeformBoneKeyframes(asThree(Three), createTraversableScene([]), [])
    })

    it('should return no issues', () => {
      expect(issues).toEqual([])
    })
  })

  describe('when there are no bones in the scene', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const anim = makeAnimation({ duration: 1, trackName: 'Hips.position' })
      issues = validateEmoteDeformBoneKeyframes(asThree(Three), createTraversableScene([]), [anim])
    })

    it('should return no issues', () => {
      expect(issues).toEqual([])
    })
  })

  describe('when all deform bones have complete keyframes', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const bone = new Three.Bone()
      bone.name = 'Hips'
      const anim = {
        name: 'Emote',
        duration: 1,
        tracks: [
          { name: 'Hips.position', times: [0, 1], values: [0, 0, 0, 0, 0, 0] },
          { name: 'Hips.quaternion', times: [0, 1], values: [0, 0, 0, 1, 0, 0, 0, 1] },
          { name: 'Hips.scale', times: [0, 1], values: [1, 1, 1, 1, 1, 1] }
        ]
      } as unknown as AnimationClip
      issues = validateEmoteDeformBoneKeyframes(asThree(Three), createTraversableScene([bone]), [anim])
    })

    it('should return no issues', () => {
      expect(issues).toEqual([])
    })
  })

  describe('when a deform bone is missing all keyframe tracks', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const bone = new Three.Bone()
      bone.name = 'Hips'
      const anim = {
        name: 'Emote',
        duration: 1,
        tracks: []
      } as unknown as AnimationClip
      issues = validateEmoteDeformBoneKeyframes(asThree(Three), createTraversableScene([bone]), [anim])
    })

    it('should return a warning with the EMOTE_MISSING_KEYFRAMES code', () => {
      expect(issues).toHaveLength(1)
      expect(issues[0].code).toBe('EMOTE_MISSING_KEYFRAMES')
      expect(issues[0].severity).toBe(ValidationSeverity.WARNING)
    })
  })

  describe('when a deform bone is missing the scale track', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const bone = new Three.Bone()
      bone.name = 'Hips'
      const anim = {
        name: 'Emote',
        duration: 1,
        tracks: [
          { name: 'Hips.position', times: [0, 1], values: [0, 0, 0, 0, 0, 0] },
          { name: 'Hips.quaternion', times: [0, 1], values: [0, 0, 0, 1, 0, 0, 0, 1] }
        ]
      } as unknown as AnimationClip
      issues = validateEmoteDeformBoneKeyframes(asThree(Three), createTraversableScene([bone]), [anim])
    })

    it('should report the missing bone property', () => {
      expect(issues).toHaveLength(1)
      expect(issues[0].messageParams?.bones).toContain('Hips.scale')
    })
  })
})

describe('validatePropTriangles', () => {
  let Three: MockThree

  beforeEach(() => {
    Three = createMockThree()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when there is no Armature_Prop in the scene', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const scene = { children: [] } as unknown as Scene
      issues = validatePropTriangles(asThree(Three), scene)
    })

    it('should return no issues', () => {
      expect(issues).toEqual([])
    })
  })

  describe('when prop triangles are within the limit', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const mesh = new Three.Mesh()
      mesh.geometry.attributes.position = { count: PROP_MAX_TRIANGLES * 3 }
      issues = validatePropTriangles(asThree(Three), createPropScene(Three, [mesh]))
    })

    it('should return no issues', () => {
      expect(issues).toEqual([])
    })
  })

  describe('when prop triangles exceed the limit', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const mesh = new Three.Mesh()
      mesh.geometry.attributes.position = { count: (PROP_MAX_TRIANGLES + 1) * 3 }
      issues = validatePropTriangles(asThree(Three), createPropScene(Three, [mesh]))
    })

    it('should return an error with the PROP_TRIANGLE_COUNT code', () => {
      expect(issues).toHaveLength(1)
      expect(issues[0].code).toBe('PROP_TRIANGLE_COUNT')
      expect(issues[0].severity).toBe(ValidationSeverity.WARNING)
    })
  })
})

describe('validatePropMaterials', () => {
  let Three: MockThree

  beforeEach(() => {
    Three = createMockThree()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when prop materials are within the limit', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const meshes = Array.from({ length: PROP_MAX_MATERIALS }, (_, i) => {
        const m = new Three.Mesh()
        m.material = { name: `PropMat${i}` }
        return m
      })
      issues = validatePropMaterials(asThree(Three), createPropScene(Three, meshes))
    })

    it('should return no issues', () => {
      expect(issues).toEqual([])
    })
  })

  describe('when prop materials exceed the limit', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const meshes = Array.from({ length: PROP_MAX_MATERIALS + 1 }, (_, i) => {
        const m = new Three.Mesh()
        m.material = { name: `PropMat${i}` }
        return m
      })
      issues = validatePropMaterials(asThree(Three), createPropScene(Three, meshes))
    })

    it('should return an error with the PROP_MATERIALS code', () => {
      expect(issues).toHaveLength(1)
      expect(issues[0].code).toBe('PROP_MATERIALS')
      expect(issues[0].severity).toBe(ValidationSeverity.WARNING)
    })
  })
})

describe('validatePropTextures', () => {
  let Three: MockThree

  beforeEach(() => {
    Three = createMockThree()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when prop textures are within the limit', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const meshes = Array.from({ length: PROP_MAX_TEXTURES }, (_, i) => {
        const m = new Three.Mesh()
        m.material = {
          name: `PropMat${i}`,
          map: { uuid: `tex${i}` },
          emissiveMap: null,
          alphaMap: null,
          aoMap: null,
          normalMap: null,
          roughnessMap: null,
          metalnessMap: null
        } as unknown as { name: string }
        return m
      })
      issues = validatePropTextures(asThree(Three), createPropScene(Three, meshes))
    })

    it('should return no issues', () => {
      expect(issues).toEqual([])
    })
  })

  describe('when prop textures exceed the limit', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const meshes = Array.from({ length: PROP_MAX_TEXTURES + 1 }, (_, i) => {
        const m = new Three.Mesh()
        m.material = {
          name: `PropMat${i}`,
          map: { uuid: `tex${i}` },
          emissiveMap: null,
          alphaMap: null,
          aoMap: null,
          normalMap: null,
          roughnessMap: null,
          metalnessMap: null
        } as unknown as { name: string }
        return m
      })
      issues = validatePropTextures(asThree(Three), createPropScene(Three, meshes))
    })

    it('should return an error with the PROP_TEXTURES code', () => {
      expect(issues).toHaveLength(1)
      expect(issues[0].code).toBe('PROP_TEXTURES')
      expect(issues[0].severity).toBe(ValidationSeverity.WARNING)
    })
  })
})

describe('validatePropArmatureBones', () => {
  let Three: MockThree

  beforeEach(() => {
    Three = createMockThree()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when bone count is within the limit', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const bones = Array.from({ length: PROP_MAX_ARMATURE_BONES }, () => {
        const b = new Three.Bone()
        b.name = 'PropBone'
        return b
      })
      issues = validatePropArmatureBones(asThree(Three), createPropScene(Three, bones))
    })

    it('should return no issues', () => {
      expect(issues).toEqual([])
    })
  })

  describe('when bone count exceeds the limit', () => {
    let issues: ValidationIssue[]

    beforeEach(() => {
      const bones = Array.from({ length: PROP_MAX_ARMATURE_BONES + 1 }, () => {
        const b = new Three.Bone()
        b.name = 'PropBone'
        return b
      })
      issues = validatePropArmatureBones(asThree(Three), createPropScene(Three, bones))
    })

    it('should return an error with the PROP_ARMATURE_BONES code', () => {
      expect(issues).toHaveLength(1)
      expect(issues[0].code).toBe('PROP_ARMATURE_BONES')
      expect(issues[0].severity).toBe(ValidationSeverity.WARNING)
    })

    it('should report the actual bone count', () => {
      expect(issues[0].messageParams?.count).toBe(PROP_MAX_ARMATURE_BONES + 1)
    })
  })
})
