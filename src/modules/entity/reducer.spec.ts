import { EntityType, EntityVersion } from 'dcl-catalyst-commons'
import {
  fetchEntitiesByIdsFailure,
  fetchEntitiesByIdsRequest,
  fetchEntitiesByIdsSuccess,
  fetchEntitiesByPointersFailure,
  fetchEntitiesByPointersRequest,
  fetchEntitiesByPointersSuccess
} from './actions'
import { EntityState, entityReducer } from './reducer'

const entity = {
  id: 'Qmhash',
  timestamp: 1234,
  type: EntityType.WEARABLE,
  pointers: ['aPointer'],
  content: [
    {
      hash: 'Qmhash',
      file: 'pepito.jpg'
    }
  ],
  metadata: {
    owner: '0xpepito',
    some: 'thing'
  },
  version: EntityVersion.V3
}

describe('when reducing the FETCH_ENTITIES_BY_POINTERS_REQUEST action', () => {
  it('should add an action to the loading state', () => {
    const state: EntityState = {
      data: {},
      loading: [],
      error: null
    }
    const action = fetchEntitiesByPointersRequest(EntityType.WEARABLE, entity.pointers)
    const newState = entityReducer(state, action)
    expect(newState.loading).toHaveLength(1)
  })
})

describe('when reducing the FETCH_ENTITIES_BY_POINTERS_SUCCESS action', () => {
  it('should insert the entity into the state data and clear the loading state', () => {
    const state: EntityState = {
      data: {},
      loading: [fetchEntitiesByPointersRequest(EntityType.WEARABLE, entity.pointers)],
      error: null
    }

    const action = fetchEntitiesByPointersSuccess(EntityType.WEARABLE, entity.pointers, [entity])
    const newState = entityReducer(state, action)
    expect(newState.data).toEqual({ [entity.id]: entity })
    expect(newState.loading).toHaveLength(0)
  })
})

describe('when reducing the FETCH_ENTITIES_BY_POINTERS_FAILURE action', () => {
  it('should store the error and clear the loading state', () => {
    const state: EntityState = {
      data: {},
      loading: [fetchEntitiesByPointersRequest(EntityType.WEARABLE, entity.pointers)],
      error: null
    }
    const error = 'Some Error'
    const action = fetchEntitiesByPointersFailure(EntityType.WEARABLE, entity.pointers, error)
    const newState = entityReducer(state, action)
    expect(newState.error).toEqual(error)
    expect(newState.loading).toHaveLength(0)
  })
})

describe('when reducing the FETCH_ENTITIES_BY_IDS_REQUEST action', () => {
  it('should add an action to the loading state', () => {
    const state: EntityState = {
      data: {},
      loading: [],
      error: null
    }
    const action = fetchEntitiesByIdsRequest(EntityType.WEARABLE, [entity.id])
    const newState = entityReducer(state, action)
    expect(newState.loading).toHaveLength(1)
  })
})

describe('when reducing the FETCH_ENTITIES_BY_IDS_SUCCESS action', () => {
  it('should insert the entity into the state data and clear the loading state', () => {
    const state: EntityState = {
      data: {},
      loading: [fetchEntitiesByIdsRequest(EntityType.WEARABLE, [entity.id])],
      error: null
    }

    const action = fetchEntitiesByIdsSuccess(EntityType.WEARABLE, [entity.id], [entity])
    const newState = entityReducer(state, action)
    expect(newState.data).toEqual({ [entity.id]: entity })
    expect(newState.loading).toHaveLength(0)
  })
})

describe('when reducing the FETCH_ENTITIES_BY_IDS_FAILURE action', () => {
  it('should store the error and clear the loading state', () => {
    const state: EntityState = {
      data: {},
      loading: [fetchEntitiesByIdsRequest(EntityType.WEARABLE, [entity.id])],
      error: null
    }
    const error = 'Some Error'
    const action = fetchEntitiesByIdsFailure(EntityType.WEARABLE, [entity.id], error)
    const newState = entityReducer(state, action)
    expect(newState.error).toEqual(error)
    expect(newState.loading).toHaveLength(0)
  })
})
