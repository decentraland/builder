import { CatalystClient } from 'dcl-catalyst-client'
import { Entity, EntityType } from '@dcl/schemas'
import { expectSaga } from 'redux-saga-test-plan'
import {
  fetchEntitiesByIdsFailure,
  fetchEntitiesByIdsRequest,
  fetchEntitiesByIdsSuccess,
  fetchEntitiesByPointersFailure,
  fetchEntitiesByPointersRequest,
  fetchEntitiesByPointersSuccess
} from './actions'
import { entitySaga } from './sagas'

describe('Entity sagas', () => {
  let catalystClient: CatalystClient
  let fetchEntitiesByPointersMock: jest.Mock

  describe('when handling the FETCH_ENTITIES_BY_POINTERS_REQUEST action', () => {
    beforeEach(() => {
      fetchEntitiesByPointersMock = jest.fn()
      catalystClient = {
        getContentClient: jest.fn().mockResolvedValue({
          fetchEntitiesByPointers: fetchEntitiesByPointersMock
        })
      } as unknown as CatalystClient
    })

    it('should dispatch a failue action if the client throws', () => {
      const pointers = ['aPointer', 'anotherPointer']
      const anErrorMessage = 'Something happened'
      fetchEntitiesByPointersMock.mockRejectedValue(new Error(anErrorMessage))
      return expectSaga(entitySaga, catalystClient)
        .put(fetchEntitiesByPointersFailure(EntityType.WEARABLE, pointers, anErrorMessage))
        .dispatch(fetchEntitiesByPointersRequest(EntityType.WEARABLE, pointers))
        .run({ silenceTimeout: true })
    })

    it('should dispatch a success action if the response returns successfully', () => {
      const pointers = ['aPointer', 'anotherPointer']
      const entities: Entity[] = [
        {
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
      ]
      fetchEntitiesByPointersMock.mockResolvedValue(entities)
      return expectSaga(entitySaga, catalystClient)
        .put(fetchEntitiesByPointersSuccess(EntityType.WEARABLE, pointers, entities))
        .dispatch(fetchEntitiesByPointersRequest(EntityType.WEARABLE, pointers))
        .run({ silenceTimeout: true })
    })
  })

  describe('when handling the FETCH_ENTITIES_BY_IDS_REQUEST action', () => {
    let fetchEntitiesByIdsMock: jest.Mock

    beforeEach(() => {
      fetchEntitiesByIdsMock = jest.fn()
      catalystClient = {
        getContentClient: jest.fn().mockResolvedValue({
          fetchEntitiesByIds: fetchEntitiesByIdsMock
        })
      } as unknown as CatalystClient
    })

    it('should dispatch a failue action if the client throws', () => {
      const ids = ['QmHash']
      const anErrorMessage = 'Something happened'
      fetchEntitiesByIdsMock.mockRejectedValue(new Error(anErrorMessage))
      return expectSaga(entitySaga, catalystClient)
        .put(fetchEntitiesByIdsFailure(EntityType.WEARABLE, ids, anErrorMessage))
        .dispatch(fetchEntitiesByIdsRequest(EntityType.WEARABLE, ids))
        .run({ silenceTimeout: true })
    })

    it('should dispatch a success action if the response returns successfully', () => {
      const ids = ['QmHash']
      const entities: Entity[] = [
        {
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
      ]
      fetchEntitiesByIdsMock.mockResolvedValue(entities)
      return expectSaga(entitySaga, catalystClient)
        .put(fetchEntitiesByIdsSuccess(EntityType.WEARABLE, ids, entities))
        .dispatch(fetchEntitiesByIdsRequest(EntityType.WEARABLE, ids))
        .run({ silenceTimeout: true })
    })
  })
})
