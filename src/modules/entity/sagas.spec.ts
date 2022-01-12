import { CatalystClient } from 'dcl-catalyst-client'
import { Entity, EntityType, EntityVersion } from 'dcl-catalyst-commons'
import { expectSaga } from 'redux-saga-test-plan'
import { call } from 'redux-saga/effects'
import { fetchEntitiesByPointersFailure, fetchEntitiesByPointersRequest, fetchEntitiesByPointersSuccess } from './actions'
import { entitySaga } from './sagas'

describe('Entity sagas', () => {
  describe('when handling the fetch entities action', () => {
    const client = ({
      fetchEntitiesByPointers: jest.fn()
    } as unknown) as CatalystClient

    it('should dispatch a failue action if the client throws', () => {
      const pointers = ['aPointer', 'anotherPointer']
      const anErrorMessage = 'Something happened'
      return expectSaga(entitySaga, client)
        .provide([[call([client, 'fetchEntitiesByPointers'], EntityType.WEARABLE, pointers), Promise.reject(new Error(anErrorMessage))]])
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
          version: EntityVersion.V3
        }
      ]
      return expectSaga(entitySaga, client)
        .provide([[call([client, 'fetchEntitiesByPointers'], EntityType.WEARABLE, pointers), Promise.resolve(entities)]])
        .put(fetchEntitiesByPointersSuccess(EntityType.WEARABLE, pointers, entities))
        .dispatch(fetchEntitiesByPointersRequest(EntityType.WEARABLE, pointers))
        .run({ silenceTimeout: true })
    })
  })
})
