import { EntityType } from '@dcl/schemas'
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
  version: 'v3'
}

describe('when reducing the FETCH_ENTITIES_BY_POINTERS_REQUEST action', () => {
  it('should add an action to the loading state', () => {
    const state: EntityState = {
      data: {},
      loading: [],
      error: null,
      missingEntities: {}
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
      error: null,
      missingEntities: {}
    }

    const action = fetchEntitiesByPointersSuccess(EntityType.WEARABLE, entity.pointers, [entity])
    const newState = entityReducer(state, action)
    expect(newState.data).toEqual({ [entity.id]: entity })
    expect(newState.loading).toHaveLength(0)
  })

  it('should track pointers with no corresponding entities in missingEntities', () => {
    const state: EntityState = {
      data: {},
      loading: [fetchEntitiesByPointersRequest(EntityType.WEARABLE, ['pointer1', 'pointer2', 'pointer3'])],
      error: null,
      missingEntities: {}
    }

    // Only 'pointer1' has a corresponding entity
    const entityWithPointer1 = {
      ...entity,
      pointers: ['pointer1']
    }

    const action = fetchEntitiesByPointersSuccess(EntityType.WEARABLE, ['pointer1', 'pointer2', 'pointer3'], [entityWithPointer1])

    const newState = entityReducer(state, action)
    expect(newState.data).toEqual({ [entityWithPointer1.id]: entityWithPointer1 })
    expect(newState.missingEntities).toEqual({
      pointer2: true,
      pointer3: true
    })
  })

  it('should preserve existing missing pointers when adding new ones', () => {
    const state: EntityState = {
      data: {},
      loading: [fetchEntitiesByPointersRequest(EntityType.WEARABLE, ['pointer4'])],
      error: null,
      missingEntities: {
        pointer2: true,
        pointer3: true
      }
    }

    // No entity returned for 'pointer4'
    const action = fetchEntitiesByPointersSuccess(EntityType.WEARABLE, ['pointer4'], [])

    const newState = entityReducer(state, action)
    expect(newState.missingEntities).toEqual({
      pointer2: true,
      pointer3: true,
      pointer4: true
    })
  })
})

describe('when reducing the FETCH_ENTITIES_BY_POINTERS_FAILURE action', () => {
  it('should store the error and clear the loading state', () => {
    const state: EntityState = {
      data: {},
      loading: [fetchEntitiesByPointersRequest(EntityType.WEARABLE, entity.pointers)],
      error: null,
      missingEntities: {}
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
      error: null,
      missingEntities: {}
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
      error: null,
      missingEntities: {}
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
      error: null,
      missingEntities: {}
    }
    const error = 'Some Error'
    const action = fetchEntitiesByIdsFailure(EntityType.WEARABLE, [entity.id], error)
    const newState = entityReducer(state, action)
    expect(newState.error).toEqual(error)
    expect(newState.loading).toHaveLength(0)
  })
})
