import { wearable } from 'specs/editor'
import {
  fetchBaseWearablesFailure,
  fetchBaseWearablesRequest,
  fetchBaseWearablesSuccess,
  FETCH_BASE_WEARABLES_FAILURE,
  FETCH_BASE_WEARABLES_REQUEST,
  FETCH_BASE_WEARABLES_SUCCESS,
  clearSpringBones,
  setBones,
  setSpringBoneParam,
  resetSpringBoneParams,
  pushSpringBoneParams,
  addSpringBoneParams,
  deleteSpringBoneParams,
  CLEAR_SPRING_BONES,
  SET_BONES,
  SET_SPRING_BONE_PARAM,
  RESET_SPRING_BONE_PARAMS,
  PUSH_SPRING_BONE_PARAMS,
  ADD_SPRING_BONE_PARAMS,
  DELETE_SPRING_BONE_PARAMS
} from './actions'
import { BoneNode } from './types'

const commonError = 'anError'

describe('when creating the action that signals the start of a base wearables fetch request', () => {
  it('should return an action signaling the start of the base wearables fetch', () => {
    expect(fetchBaseWearablesRequest()).toEqual({ type: FETCH_BASE_WEARABLES_REQUEST })
  })
})

describe('when creating the action that signals the successful fetch of tiers', () => {
  it('should return an action signaling the success of the base wearables fetch', () => {
    expect(fetchBaseWearablesSuccess([wearable])).toEqual({
      type: FETCH_BASE_WEARABLES_SUCCESS,
      payload: { wearables: [wearable] }
    })
  })
})

describe('when creating the action that signals the unsuccessful fetch of tiers', () => {
  it('should return an action signaling the failure of the base wearables fetch', () => {
    expect(fetchBaseWearablesFailure(commonError)).toEqual({
      type: FETCH_BASE_WEARABLES_FAILURE,
      payload: { error: commonError }
    })
  })
})

describe('when creating the action that clears spring bones', () => {
  it('should return an action with type CLEAR_SPRING_BONES', () => {
    expect(clearSpringBones()).toEqual({ type: CLEAR_SPRING_BONES })
  })
})

describe('when creating the action that sets bones', () => {
  it('should return an action with bones and selectedItemGlbHash payload', () => {
    const bones: BoneNode[] = [{ name: 'Hips', nodeId: 0, type: 'avatar', children: [] }]
    expect(setBones(bones, 'aHash')).toEqual({
      type: SET_BONES,
      payload: { bones, selectedItemGlbHash: 'aHash' }
    })
  })
})

describe('when creating the action that sets a spring bone param', () => {
  it('should return an action with boneName, field, and value payload', () => {
    expect(setSpringBoneParam('springbone_hair', 'stiffness', 0.5)).toEqual({
      type: SET_SPRING_BONE_PARAM,
      payload: { boneName: 'springbone_hair', field: 'stiffness', value: 0.5 }
    })
  })
})

describe('when creating the action that resets spring bone params', () => {
  it('should return an action with type RESET_SPRING_BONE_PARAMS', () => {
    expect(resetSpringBoneParams()).toEqual({ type: RESET_SPRING_BONE_PARAMS })
  })
})

describe('when creating the action that pushes spring bone params', () => {
  it('should return an action with type PUSH_SPRING_BONE_PARAMS', () => {
    expect(pushSpringBoneParams()).toEqual({ type: PUSH_SPRING_BONE_PARAMS })
  })
})

describe('when creating the action that adds spring bone params', () => {
  it('should return an action with boneName payload', () => {
    expect(addSpringBoneParams('springbone_tail')).toEqual({
      type: ADD_SPRING_BONE_PARAMS,
      payload: { boneName: 'springbone_tail' }
    })
  })
})

describe('when creating the action that deletes spring bone params', () => {
  it('should return an action with boneName payload', () => {
    expect(deleteSpringBoneParams('springbone_hair')).toEqual({
      type: DELETE_SPRING_BONE_PARAMS,
      payload: { boneName: 'springbone_hair' }
    })
  })
})
