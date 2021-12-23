import { wearable } from 'specs/editor'
import {
  fetchBaseWearablesFailure,
  fetchBaseWearablesRequest,
  fetchBaseWearablesSuccess,
  FETCH_BASE_WEARABLES_FAILURE,
  FETCH_BASE_WEARABLES_REQUEST,
  FETCH_BASE_WEARABLES_SUCCESS
} from './actions'

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
