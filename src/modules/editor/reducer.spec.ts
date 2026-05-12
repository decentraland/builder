import { BodyShape, WearableCategory } from '@dcl/schemas'
import type { Wearable } from 'decentraland-ecs'
import { anotherWearable, convertWearable, wearable } from 'specs/editor'
import { mockedItem } from 'specs/item'
import { saveItemSuccess } from 'modules/item/actions'
import { getDefaultSpringBoneParams } from 'lib/springBones'
import {
  fetchBaseWearablesFailure,
  fetchBaseWearablesRequest,
  fetchBaseWearablesSuccess,
  setBaseWearable,
  clearSpringBones,
  setBones,
  setSpringBoneParam,
  resetSpringBoneParams,
  addSpringBoneParams,
  deleteSpringBoneParams
} from './actions'
import { BoneNode } from './types'
import { editorReducer, EditorState, INITIAL_STATE } from './reducer'

const DEFAULT_SPRING_BONE_PARAMS = getDefaultSpringBoneParams()
let state: EditorState

beforeEach(() => {
  state = {
    ...INITIAL_STATE
  }
})

describe('when reducing the action that sets the selected base wearable', () => {
  beforeEach(() => {
    state = {
      ...state,
      selectedBaseWearablesByBodyShape: {
        [BodyShape.FEMALE]: {
          [anotherWearable.category]: anotherWearable
        }
      } as Record<BodyShape, Record<string, Wearable | null>>
    }
  })

  it('should return a state with the new wearable set with the given category and body shape', () => {
    expect(editorReducer(state, setBaseWearable(wearable.category as WearableCategory, BodyShape.MALE, wearable))).toEqual({
      ...state,
      selectedBaseWearablesByBodyShape: {
        ...state.selectedBaseWearablesByBodyShape,
        [BodyShape.MALE]: {
          [wearable.category]: wearable
        }
      }
    })
  })
})

describe('when reducing the action that starts the fetching of the base wearables', () => {
  it('should set the request as loading and clear the error', () => {
    expect(editorReducer(state, fetchBaseWearablesRequest())).toEqual({
      ...state,
      fetchingBaseWearablesError: null,
      loading: [fetchBaseWearablesRequest()]
    })
  })
})

describe('when reducing the action that signals a successful fetching of the base wearables', () => {
  let femaleHairWearable: Wearable
  let femaleUpperBodyWearable: Wearable
  let femaleLowerBodyWearable: Wearable
  let maleHairWearable: Wearable
  let maleFacialHairWearable: Wearable
  let maleUpperBodyWearable: Wearable
  let maleLowerBodyWearable: Wearable
  let wearables: Wearable[]

  beforeEach(() => {
    femaleHairWearable = convertWearable(wearable, WearableCategory.HAIR, BodyShape.FEMALE)
    femaleUpperBodyWearable = convertWearable(wearable, WearableCategory.UPPER_BODY, BodyShape.FEMALE)
    femaleLowerBodyWearable = convertWearable(wearable, WearableCategory.LOWER_BODY, BodyShape.FEMALE)
    maleHairWearable = convertWearable(wearable, WearableCategory.HAIR, BodyShape.MALE)
    maleFacialHairWearable = convertWearable(wearable, WearableCategory.FACIAL_HAIR, BodyShape.MALE)
    maleUpperBodyWearable = convertWearable(wearable, WearableCategory.UPPER_BODY, BodyShape.MALE)
    maleLowerBodyWearable = convertWearable(wearable, WearableCategory.LOWER_BODY, BodyShape.MALE)
    wearables = [
      femaleHairWearable,
      femaleUpperBodyWearable,
      femaleLowerBodyWearable,
      maleHairWearable,
      maleFacialHairWearable,
      maleUpperBodyWearable,
      maleLowerBodyWearable
    ]
  })

  it('should set the wearables, the selectedBaseWearables with the given wearables and clear the loading and error', () => {
    expect(editorReducer(state, fetchBaseWearablesSuccess(wearables))).toEqual({
      ...state,
      fetchingBaseWearablesError: null,
      loading: [],
      baseWearables: wearables,
      selectedBaseWearablesByBodyShape: {
        [BodyShape.FEMALE]: {
          [WearableCategory.HAIR]: femaleHairWearable,
          [WearableCategory.FACIAL_HAIR]: null,
          [WearableCategory.UPPER_BODY]: femaleUpperBodyWearable,
          [WearableCategory.LOWER_BODY]: femaleLowerBodyWearable
        },
        [BodyShape.MALE]: {
          [WearableCategory.HAIR]: maleHairWearable,
          [WearableCategory.FACIAL_HAIR]: maleFacialHairWearable,
          [WearableCategory.UPPER_BODY]: maleUpperBodyWearable,
          [WearableCategory.LOWER_BODY]: maleLowerBodyWearable
        }
      }
    })
  })
})

describe('when reducing the action that signals a failing fetching of the base wearables', () => {
  it('should set the error and clear the loading', () => {
    expect(editorReducer(state, fetchBaseWearablesFailure('anError'))).toEqual({
      ...state,
      fetchingBaseWearablesError: 'anError',
      loading: []
    })
  })
})

describe('when reducing the action that clears spring bones', () => {
  beforeEach(() => {
    state = {
      ...state,
      bonesByHash: { hashA: [{ name: 'springbone_hair', nodeId: 0, type: 'spring', children: [] }] },
      selectedItemId: 'anItemId',
      springBoneParamsByHash: { hashA: { springbone_hair: { ...DEFAULT_SPRING_BONE_PARAMS } } },
      originalSpringBoneParamsByHash: { hashA: { springbone_hair: { ...DEFAULT_SPRING_BONE_PARAMS } } }
    }
  })

  it('should reset all hash-keyed spring bone slices and clear selectedItemId', () => {
    expect(editorReducer(state, clearSpringBones())).toEqual({
      ...state,
      selectedItemId: null,
      bonesByHash: {},
      springBoneParamsByHash: {},
      originalSpringBoneParamsByHash: {}
    })
  })
})

describe('when reducing the action that sets bones', () => {
  const springBoneWithParams: BoneNode = {
    name: 'springbone_hair',
    nodeId: 1,
    type: 'spring',
    children: [],
    params: { stiffness: 0.5, gravityPower: 1, gravityDir: [0, -1, 0], drag: 0.3, center: undefined }
  }
  const springBoneWithoutParams: BoneNode = {
    name: 'springbone_tail',
    nodeId: 2,
    type: 'spring',
    children: []
  }
  const avatarBone: BoneNode = { name: 'Hips', nodeId: 0, type: 'avatar', children: [1, 2] }

  it('should store bones under the given hash and set selectedItemId', () => {
    const bones = [avatarBone, springBoneWithParams]
    const result = editorReducer(state, setBones('glbHash123', bones, 'anItemId'))

    expect(result.bonesByHash['glbHash123']).toEqual(bones)
    expect(result.selectedItemId).toBe('anItemId')
  })

  it('should extract springBoneParams from spring-type bones that have params under the given hash', () => {
    const bones = [avatarBone, springBoneWithParams]
    const result = editorReducer(state, setBones('glbHash123', bones, 'anItemId'))

    expect(result.springBoneParamsByHash['glbHash123']).toEqual({
      springbone_hair: springBoneWithParams.params
    })
  })

  it('should set originalSpringBoneParamsByHash[hash] as a copy of the extracted springBoneParams', () => {
    const bones = [avatarBone, springBoneWithParams]
    const result = editorReducer(state, setBones('glbHash123', bones, 'anItemId'))

    expect(result.originalSpringBoneParamsByHash['glbHash123']).toEqual(result.springBoneParamsByHash['glbHash123'])
  })

  it('should ignore avatar-type bones when building springBoneParams', () => {
    const bones = [avatarBone]
    const result = editorReducer(state, setBones('glbHash123', bones, 'anItemId'))

    expect(result.springBoneParamsByHash['glbHash123']).toEqual({})
  })

  it('should not add an entry for spring bones without params', () => {
    const bones = [avatarBone, springBoneWithoutParams]
    const result = editorReducer(state, setBones('glbHash123', bones, 'anItemId'))

    expect(result.springBoneParamsByHash['glbHash123']).toEqual({})
  })

  it('should preserve existing edited params for the same hash on a re-set (late GLB fetch)', () => {
    const editedParams = {
      stiffness: 0.99,
      gravityPower: 5,
      gravityDir: [0, -1, 0] as [number, number, number],
      drag: 0.1,
      center: undefined
    }
    state = {
      ...state,
      springBoneParamsByHash: { glbHash123: { springbone_hair: editedParams } }
    }
    const bones = [avatarBone, springBoneWithParams]
    const result = editorReducer(state, setBones('glbHash123', bones, 'anItemId'))

    expect(result.springBoneParamsByHash['glbHash123']).toEqual({ springbone_hair: editedParams })
    // Originals reflect the freshly-parsed metadata, not the stashed edits.
    expect(result.originalSpringBoneParamsByHash['glbHash123']).toEqual({ springbone_hair: springBoneWithParams.params })
  })
})

describe('when reducing the action that sets a spring bone param', () => {
  beforeEach(() => {
    state = {
      ...state,
      springBoneParamsByHash: {
        hashA: {
          springbone_hair: { stiffness: 1, gravityPower: 0, gravityDir: [0, -1, 0], drag: 0.4, center: undefined },
          springbone_tail: { stiffness: 0.5, gravityPower: 0, gravityDir: [0, -1, 0], drag: 0.2, center: undefined }
        }
      },
      originalSpringBoneParamsByHash: {
        hashA: { springbone_hair: { stiffness: 1, gravityPower: 0, gravityDir: [0, -1, 0], drag: 0.4, center: undefined } }
      }
    }
  })

  it('should update a single field on the specified bone params under the given hash', () => {
    const result = editorReducer(state, setSpringBoneParam('hashA', 'springbone_hair', 'stiffness', 0.8))

    expect(result.springBoneParamsByHash['hashA'].springbone_hair.stiffness).toBe(0.8)
  })

  it('should not affect other bones params under the same hash', () => {
    const result = editorReducer(state, setSpringBoneParam('hashA', 'springbone_hair', 'stiffness', 0.8))

    expect(result.springBoneParamsByHash['hashA'].springbone_tail).toEqual(state.springBoneParamsByHash['hashA'].springbone_tail)
  })

  it('should not modify originalSpringBoneParamsByHash', () => {
    const result = editorReducer(state, setSpringBoneParam('hashA', 'springbone_hair', 'stiffness', 0.8))

    expect(result.originalSpringBoneParamsByHash).toEqual(state.originalSpringBoneParamsByHash)
  })
})

describe('when reducing the action that adds spring bone params', () => {
  beforeEach(() => {
    state = {
      ...state,
      springBoneParamsByHash: {
        hashA: { springbone_hair: { stiffness: 0.5, gravityPower: 0, gravityDir: [0, -1, 0], drag: 0.4, center: undefined } }
      }
    }
  })

  it('should add DEFAULT_SPRING_BONE_PARAMS for the given bone name under the given hash', () => {
    const result = editorReducer(state, addSpringBoneParams('hashA', 'springbone_tail'))

    expect(result.springBoneParamsByHash['hashA'].springbone_tail).toEqual(DEFAULT_SPRING_BONE_PARAMS)
  })

  it('should not overwrite existing params for other bones under the same hash', () => {
    const result = editorReducer(state, addSpringBoneParams('hashA', 'springbone_tail'))

    expect(result.springBoneParamsByHash['hashA'].springbone_hair).toEqual(state.springBoneParamsByHash['hashA'].springbone_hair)
  })
})

describe('when reducing the action that deletes spring bone params', () => {
  beforeEach(() => {
    state = {
      ...state,
      springBoneParamsByHash: {
        hashA: {
          springbone_hair: { stiffness: 0.5, gravityPower: 0, gravityDir: [0, -1, 0], drag: 0.4, center: undefined },
          springbone_tail: { stiffness: 1, gravityPower: 0, gravityDir: [0, -1, 0], drag: 0.2, center: undefined }
        }
      }
    }
  })

  it('should remove params for the given bone name under the given hash', () => {
    const result = editorReducer(state, deleteSpringBoneParams('hashA', 'springbone_hair'))

    expect(result.springBoneParamsByHash['hashA'].springbone_hair).toBeUndefined()
  })

  it('should preserve params for other bones under the same hash', () => {
    const result = editorReducer(state, deleteSpringBoneParams('hashA', 'springbone_hair'))

    expect(result.springBoneParamsByHash['hashA'].springbone_tail).toEqual(state.springBoneParamsByHash['hashA'].springbone_tail)
  })
})

describe('when reducing the action that resets spring bone params', () => {
  beforeEach(() => {
    state = {
      ...state,
      springBoneParamsByHash: {
        hashA: { springbone_hair: { stiffness: 0.8, gravityPower: 2, gravityDir: [1, 0, 0], drag: 0.1, center: undefined } }
      },
      originalSpringBoneParamsByHash: {
        hashA: { springbone_hair: { stiffness: 1, gravityPower: 0, gravityDir: [0, -1, 0], drag: 0.4, center: undefined } }
      }
    }
  })

  it('should restore springBoneParamsByHash to match originalSpringBoneParamsByHash', () => {
    const result = editorReducer(state, resetSpringBoneParams())

    expect(result.springBoneParamsByHash).toEqual(state.originalSpringBoneParamsByHash)
  })
})

describe('when reducing a save item success action', () => {
  beforeEach(() => {
    state = {
      ...state,
      selectedItemId: mockedItem.id,
      springBoneParamsByHash: {
        hashA: { springbone_hair: { stiffness: 0.8, gravityPower: 2, gravityDir: [1, 0, 0], drag: 0.1, center: undefined } }
      },
      originalSpringBoneParamsByHash: {
        hashA: { springbone_hair: { stiffness: 1, gravityPower: 0, gravityDir: [0, -1, 0], drag: 0.4, center: undefined } }
      }
    }
  })

  it('should update originalSpringBoneParamsByHash to match current springBoneParamsByHash', () => {
    const result = editorReducer(state, saveItemSuccess(mockedItem, {}))

    expect(result.originalSpringBoneParamsByHash).toEqual(state.springBoneParamsByHash)
  })
})
