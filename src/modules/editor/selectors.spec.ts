import { BodyShape, WearableCategory } from '@dcl/schemas'
import { RootState } from 'modules/common/types'
import { wearable } from 'specs/editor'
import { FETCH_BASE_WEARABLES_REQUEST } from './actions'
import { INITIAL_STATE } from './reducer'
import { BoneNode } from './types'
import {
  getFetchingBaseWearablesError,
  getSelectedBaseWearablesByBodyShape,
  isLoadingBaseWearables,
  getBones,
  getSpringBones,
  getAvatarBones,
  getSelectedItemId,
  getSpringBoneParams,
  getOriginalSpringBoneParams,
  hasSpringBoneChanges
} from './selectors'

let state: RootState
const originalLocation = window.location

beforeAll(() => {
  ;(window as any).location = {
    ...originalLocation
  }
})

afterAll(() => {
  ;(window as any).location = originalLocation
})

beforeEach(() => {
  state = {
    editor: {
      ...INITIAL_STATE
    }
  } as RootState
})

describe('when getting if the base wearables are being loaded', () => {
  describe('and the base wearables are being fetched', () => {
    beforeEach(() => {
      state = {
        ...state,
        editor: {
          ...state.editor,
          loading: [{ type: FETCH_BASE_WEARABLES_REQUEST }],
          baseWearables: [],
          fetchingBaseWearablesError: null
        }
      }
    })

    it('should return true', () => {
      expect(isLoadingBaseWearables(state)).toBe(true)
    })
  })

  describe("and there are no base wearables and there's no error", () => {
    beforeEach(() => {
      state = {
        ...state,
        editor: {
          ...state.editor,
          loading: [],
          baseWearables: [],
          fetchingBaseWearablesError: null
        }
      }
    })

    it('should return true', () => {
      expect(isLoadingBaseWearables(state)).toBe(true)
    })
  })

  describe("and the base wearables are not being fetched and there's an error nor base wearables", () => {
    beforeEach(() => {
      state = {
        ...state,
        editor: {
          ...state.editor,
          loading: [],
          baseWearables: [],
          fetchingBaseWearablesError: 'someError'
        }
      }
    })

    it('should return false', () => {
      expect(isLoadingBaseWearables(state)).toBe(false)
    })
  })

  describe("and the base wearables are not being fetched and base wearables already exist and there's no error", () => {
    beforeEach(() => {
      state = {
        ...state,
        editor: {
          ...state.editor,
          loading: [],
          baseWearables: [wearable],
          fetchingBaseWearablesError: null
        }
      }
    })

    it('should return false', () => {
      expect(isLoadingBaseWearables(state)).toBe(false)
    })
  })
})

describe('when getting the selected base wearables', () => {
  beforeEach(() => {
    state = {
      ...state,
      editor: {
        ...state.editor,
        selectedBaseWearablesByBodyShape: {
          [BodyShape.FEMALE]: {
            [WearableCategory.HAIR]: wearable,
            [WearableCategory.FACIAL_HAIR]: null,
            [WearableCategory.UPPER_BODY]: wearable,
            [WearableCategory.LOWER_BODY]: wearable
          },
          [BodyShape.MALE]: {
            [WearableCategory.HAIR]: wearable,
            [WearableCategory.FACIAL_HAIR]: wearable,
            [WearableCategory.UPPER_BODY]: wearable,
            [WearableCategory.LOWER_BODY]: wearable
          }
        }
      }
    }
  })

  it('should return the selected base wearables', () => {
    expect(getSelectedBaseWearablesByBodyShape(state)).toEqual(state.editor.selectedBaseWearablesByBodyShape)
  })
})

describe('when getting the fetching base wearable error', () => {
  beforeEach(() => {
    state = {
      ...state,
      editor: {
        ...state.editor,
        fetchingBaseWearablesError: 'someError'
      }
    }
  })

  it('should return the fetching base wearable error', () => {
    expect(getFetchingBaseWearablesError(state)).toEqual('someError')
  })
})

describe('when getting bones', () => {
  const avatarBone: BoneNode = { name: 'Hips', nodeId: 0, type: 'avatar', children: [1] }
  const springBone: BoneNode = { name: 'springbone_hair', nodeId: 1, type: 'spring', children: [] }

  beforeEach(() => {
    state = {
      ...state,
      editor: {
        ...state.editor,
        bones: [avatarBone, springBone]
      }
    }
  })

  it('should return all bones', () => {
    expect(getBones(state)).toEqual([avatarBone, springBone])
  })
})

describe('when getting spring bones', () => {
  const avatarBone: BoneNode = { name: 'Hips', nodeId: 0, type: 'avatar', children: [1] }
  const springBone: BoneNode = { name: 'springbone_hair', nodeId: 1, type: 'spring', children: [] }

  beforeEach(() => {
    state = {
      ...state,
      editor: {
        ...state.editor,
        bones: [avatarBone, springBone]
      }
    }
  })

  it('should return only bones with type spring', () => {
    expect(getSpringBones(state)).toEqual([springBone])
  })
})

describe('when getting avatar bones', () => {
  const avatarBone: BoneNode = { name: 'Hips', nodeId: 0, type: 'avatar', children: [1] }
  const springBone: BoneNode = { name: 'springbone_hair', nodeId: 1, type: 'spring', children: [] }

  beforeEach(() => {
    state = {
      ...state,
      editor: {
        ...state.editor,
        bones: [avatarBone, springBone]
      }
    }
  })

  it('should return only bones with type avatar', () => {
    expect(getAvatarBones(state)).toEqual([avatarBone])
  })
})

describe('when getting the selected item GLB hash', () => {
  beforeEach(() => {
    state = {
      ...state,
      editor: {
        ...state.editor,
        selectedItemId: 'aGlbHash'
      }
    }
  })

  it('should return the selected item GLB hash', () => {
    expect(getSelectedItemId(state)).toBe('aGlbHash')
  })
})

describe('when getting spring bone params', () => {
  const params = {
    springbone_hair: {
      stiffness: 1,
      gravityPower: 0,
      gravityDir: [0, -1, 0] as [number, number, number],
      drag: 0.4,
      center: undefined
    }
  }

  beforeEach(() => {
    state = {
      ...state,
      editor: {
        ...state.editor,
        springBoneParams: params
      }
    }
  })

  it('should return the spring bone params', () => {
    expect(getSpringBoneParams(state)).toEqual(params)
  })
})

describe('when getting original spring bone params', () => {
  const params = {
    springbone_hair: {
      stiffness: 1,
      gravityPower: 0,
      gravityDir: [0, -1, 0] as [number, number, number],
      drag: 0.4,
      center: undefined
    }
  }

  beforeEach(() => {
    state = {
      ...state,
      editor: {
        ...state.editor,
        originalSpringBoneParams: params
      }
    }
  })

  it('should return the original spring bone params', () => {
    expect(getOriginalSpringBoneParams(state)).toEqual(params)
  })
})

describe('when checking if spring bone params have changed', () => {
  const originalParams = {
    springbone_hair: {
      stiffness: 1,
      gravityPower: 0,
      gravityDir: [0, -1, 0] as [number, number, number],
      drag: 0.4,
      center: undefined
    }
  }

  describe('and springBoneParams equals originalSpringBoneParams', () => {
    beforeEach(() => {
      state = {
        ...state,
        editor: {
          ...state.editor,
          springBoneParams: { ...originalParams },
          originalSpringBoneParams: { ...originalParams }
        }
      }
    })

    it('should return false', () => {
      expect(hasSpringBoneChanges(state)).toBe(false)
    })
  })

  describe('and springBoneParams differs from originalSpringBoneParams', () => {
    beforeEach(() => {
      state = {
        ...state,
        editor: {
          ...state.editor,
          springBoneParams: {
            springbone_hair: { ...originalParams.springbone_hair, stiffness: 0.5 }
          },
          originalSpringBoneParams: { ...originalParams }
        }
      }
    })

    it('should return true', () => {
      expect(hasSpringBoneChanges(state)).toBe(true)
    })
  })

  describe('and both are empty', () => {
    beforeEach(() => {
      state = {
        ...state,
        editor: {
          ...state.editor,
          springBoneParams: {},
          originalSpringBoneParams: {}
        }
      }
    })

    it('should return false', () => {
      expect(hasSpringBoneChanges(state)).toBe(false)
    })
  })
})
