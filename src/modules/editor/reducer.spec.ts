import { BodyShape, WearableCategory } from '@dcl/schemas'
import type { Wearable } from 'decentraland-ecs'
import { anotherWearable, convertWearable, wearable } from 'specs/editor'
import { mockedItem } from 'specs/item'
import { saveItemSuccess } from 'modules/item/actions'
import { DEFAULT_SPRING_BONE_PARAMS } from 'lib/parseSpringBones'
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
      bones: [{ name: 'springbone_hair', nodeId: 0, type: 'spring', children: [] }],
      selectedItemGlbHash: 'aHash',
      springBoneParams: { springbone_hair: { ...DEFAULT_SPRING_BONE_PARAMS } },
      originalSpringBoneParams: { springbone_hair: { ...DEFAULT_SPRING_BONE_PARAMS } }
    }
  })

  it('should reset bones, selectedItemGlbHash, springBoneParams, and originalSpringBoneParams to initial values', () => {
    expect(editorReducer(state, clearSpringBones())).toEqual({
      ...state,
      bones: [],
      selectedItemGlbHash: null,
      springBoneParams: {},
      originalSpringBoneParams: {}
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

  it('should set bones and selectedItemGlbHash from action payload', () => {
    const bones = [avatarBone, springBoneWithParams]
    const result = editorReducer(state, setBones(bones, 'glbHash123'))

    expect(result.bones).toEqual(bones)
    expect(result.selectedItemGlbHash).toBe('glbHash123')
  })

  it('should extract springBoneParams from spring-type bones that have params', () => {
    const bones = [avatarBone, springBoneWithParams]
    const result = editorReducer(state, setBones(bones, 'glbHash123'))

    expect(result.springBoneParams).toEqual({
      springbone_hair: springBoneWithParams.params
    })
  })

  it('should set originalSpringBoneParams as a copy of the extracted springBoneParams', () => {
    const bones = [avatarBone, springBoneWithParams]
    const result = editorReducer(state, setBones(bones, 'glbHash123'))

    expect(result.originalSpringBoneParams).toEqual(result.springBoneParams)
  })

  it('should ignore avatar-type bones when building springBoneParams', () => {
    const bones = [avatarBone]
    const result = editorReducer(state, setBones(bones, 'glbHash123'))

    expect(result.springBoneParams).toEqual({})
  })

  it('should not add an entry for spring bones without params', () => {
    const bones = [avatarBone, springBoneWithoutParams]
    const result = editorReducer(state, setBones(bones, 'glbHash123'))

    expect(result.springBoneParams).toEqual({})
  })
})

describe('when reducing the action that sets a spring bone param', () => {
  beforeEach(() => {
    state = {
      ...state,
      springBoneParams: {
        springbone_hair: { stiffness: 1, gravityPower: 0, gravityDir: [0, -1, 0], drag: 0.4, center: undefined },
        springbone_tail: { stiffness: 0.5, gravityPower: 0, gravityDir: [0, -1, 0], drag: 0.2, center: undefined }
      },
      originalSpringBoneParams: {
        springbone_hair: { stiffness: 1, gravityPower: 0, gravityDir: [0, -1, 0], drag: 0.4, center: undefined }
      }
    }
  })

  it('should update a single field on the specified bone params', () => {
    const result = editorReducer(state, setSpringBoneParam('springbone_hair', 'stiffness', 0.8))

    expect(result.springBoneParams.springbone_hair.stiffness).toBe(0.8)
  })

  it('should not affect other bones params', () => {
    const result = editorReducer(state, setSpringBoneParam('springbone_hair', 'stiffness', 0.8))

    expect(result.springBoneParams.springbone_tail).toEqual(state.springBoneParams.springbone_tail)
  })

  it('should not modify originalSpringBoneParams', () => {
    const result = editorReducer(state, setSpringBoneParam('springbone_hair', 'stiffness', 0.8))

    expect(result.originalSpringBoneParams).toEqual(state.originalSpringBoneParams)
  })
})

describe('when reducing the action that adds spring bone params', () => {
  beforeEach(() => {
    state = {
      ...state,
      springBoneParams: {
        springbone_hair: { stiffness: 0.5, gravityPower: 0, gravityDir: [0, -1, 0], drag: 0.4, center: undefined }
      }
    }
  })

  it('should add DEFAULT_SPRING_BONE_PARAMS for the given bone name', () => {
    const result = editorReducer(state, addSpringBoneParams('springbone_tail'))

    expect(result.springBoneParams.springbone_tail).toEqual(DEFAULT_SPRING_BONE_PARAMS)
  })

  it('should not overwrite existing params for other bones', () => {
    const result = editorReducer(state, addSpringBoneParams('springbone_tail'))

    expect(result.springBoneParams.springbone_hair).toEqual(state.springBoneParams.springbone_hair)
  })
})

describe('when reducing the action that deletes spring bone params', () => {
  beforeEach(() => {
    state = {
      ...state,
      springBoneParams: {
        springbone_hair: { stiffness: 0.5, gravityPower: 0, gravityDir: [0, -1, 0], drag: 0.4, center: undefined },
        springbone_tail: { stiffness: 1, gravityPower: 0, gravityDir: [0, -1, 0], drag: 0.2, center: undefined }
      }
    }
  })

  it('should remove params for the given bone name', () => {
    const result = editorReducer(state, deleteSpringBoneParams('springbone_hair'))

    expect(result.springBoneParams.springbone_hair).toBeUndefined()
  })

  it('should preserve params for other bones', () => {
    const result = editorReducer(state, deleteSpringBoneParams('springbone_hair'))

    expect(result.springBoneParams.springbone_tail).toEqual(state.springBoneParams.springbone_tail)
  })
})

describe('when reducing the action that resets spring bone params', () => {
  beforeEach(() => {
    state = {
      ...state,
      springBoneParams: {
        springbone_hair: { stiffness: 0.8, gravityPower: 2, gravityDir: [1, 0, 0], drag: 0.1, center: undefined }
      },
      originalSpringBoneParams: {
        springbone_hair: { stiffness: 1, gravityPower: 0, gravityDir: [0, -1, 0], drag: 0.4, center: undefined }
      }
    }
  })

  it('should restore springBoneParams to match originalSpringBoneParams', () => {
    const result = editorReducer(state, resetSpringBoneParams())

    expect(result.springBoneParams).toEqual(state.originalSpringBoneParams)
  })
})

describe('when reducing a save item success action', () => {
  beforeEach(() => {
    state = {
      ...state,
      springBoneParams: {
        springbone_hair: { stiffness: 0.8, gravityPower: 2, gravityDir: [1, 0, 0], drag: 0.1, center: undefined }
      },
      originalSpringBoneParams: {
        springbone_hair: { stiffness: 1, gravityPower: 0, gravityDir: [0, -1, 0], drag: 0.4, center: undefined }
      }
    }
  })

  it('should update originalSpringBoneParams to match current springBoneParams', () => {
    const result = editorReducer(state, saveItemSuccess(mockedItem, {}))

    expect(result.originalSpringBoneParams).toEqual(state.springBoneParams)
  })
})
