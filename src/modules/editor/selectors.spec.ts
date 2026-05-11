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
  getBonesByHash,
  getSelectedItemId,
  getSpringBoneParamsByHash,
  getOriginalSpringBoneParamsByHash,
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

describe('when getting bones by hash', () => {
  const avatarBone: BoneNode = { name: 'Hips', nodeId: 0, type: 'avatar', children: [1] }
  const springBone: BoneNode = { name: 'springbone_hair', nodeId: 1, type: 'spring', children: [] }

  beforeEach(() => {
    state = {
      ...state,
      editor: {
        ...state.editor,
        bonesByHash: { hashA: [avatarBone, springBone] }
      }
    }
  })

  it('should return all bones stored for the given hash', () => {
    expect(getBonesByHash(state)['hashA']).toEqual([avatarBone, springBone])
  })
})

describe('when getting the selected item id', () => {
  beforeEach(() => {
    state = {
      ...state,
      editor: {
        ...state.editor,
        selectedItemId: 'anItemId'
      }
    }
  })

  it('should return the selected item id', () => {
    expect(getSelectedItemId(state)).toBe('anItemId')
  })
})

describe('when getting spring bone params by hash', () => {
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
        springBoneParamsByHash: { hashA: params }
      }
    }
  })

  it('should return the spring bone params keyed by hash', () => {
    expect(getSpringBoneParamsByHash(state)).toEqual({ hashA: params })
  })
})

describe('when getting original spring bone params by hash', () => {
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
        originalSpringBoneParamsByHash: { hashA: params }
      }
    }
  })

  it('should return the original spring bone params keyed by hash', () => {
    expect(getOriginalSpringBoneParamsByHash(state)).toEqual({ hashA: params })
  })
})

describe('when checking if spring bone params have changed', () => {
  const boneParams = {
    springbone_hair: {
      stiffness: 1,
      gravityPower: 0,
      gravityDir: [0, -1, 0] as [number, number, number],
      drag: 0.4,
      center: undefined
    }
  }

  describe('and springBoneParamsByHash equals originalSpringBoneParamsByHash', () => {
    beforeEach(() => {
      state = {
        ...state,
        editor: {
          ...state.editor,
          springBoneParamsByHash: { hashA: { ...boneParams } },
          originalSpringBoneParamsByHash: { hashA: { ...boneParams } }
        }
      }
    })

    it('should return false', () => {
      expect(hasSpringBoneChanges(state)).toBe(false)
    })
  })

  describe('and springBoneParamsByHash differs from originalSpringBoneParamsByHash', () => {
    beforeEach(() => {
      state = {
        ...state,
        editor: {
          ...state.editor,
          springBoneParamsByHash: {
            hashA: { springbone_hair: { ...boneParams.springbone_hair, stiffness: 0.5 } }
          },
          originalSpringBoneParamsByHash: { hashA: { ...boneParams } }
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
          springBoneParamsByHash: {},
          originalSpringBoneParamsByHash: {}
        }
      }
    })

    it('should return false', () => {
      expect(hasSpringBoneChanges(state)).toBe(false)
    })
  })
})
