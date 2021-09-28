import { CatalystClient, DeploymentOptions, DeploymentWithMetadataContentAndPointers } from 'dcl-catalyst-client'
import { EntityType } from 'dcl-catalyst-commons'
import { expectSaga } from 'redux-saga-test-plan'
import { call } from 'redux-saga/effects'
import { fetchEntitiesFailure, fetchEntitiesRequest, fetchEntitiesSuccess } from './actions'
import { entitySaga } from './sagas'

describe('Entity sagas', () => {
  describe('when handling the fetch entities action', () => {
    const client = ({
      fetchAllDeployments: jest.fn()
    } as unknown) as CatalystClient

    it('should dispatch a failue action if the client throws', () => {
      const options: DeploymentOptions<DeploymentWithMetadataContentAndPointers> = { filters: { pointers: ['aPointer', 'anotherPointer'] } }
      const anErrorMessage = 'Something happened'
      return expectSaga(entitySaga, client)
        .provide([[call([client, 'fetchAllDeployments'], options), Promise.reject(new Error(anErrorMessage))]])
        .put(fetchEntitiesFailure(anErrorMessage, options))
        .dispatch(fetchEntitiesRequest(options))
        .run({ silenceTimeout: true })
    })

    it('should dispatch a success action if the response returns successfully', () => {
      const options: DeploymentOptions<DeploymentWithMetadataContentAndPointers> = { filters: { pointers: ['aPointer', 'anotherPointer'] } }
      const entities: DeploymentWithMetadataContentAndPointers[] = [
        {
          entityId: 'Qmhash',
          deployedBy: '0xhash',
          entityTimestamp: 1234,
          entityType: EntityType.WEARABLE,
          pointers: ['aPointer'],
          content: [
            {
              hash: 'Qmhash',
              key: 'pepito.jpg'
            }
          ],
          metadata: {
            some: 'thing'
          }
        }
      ]
      return expectSaga(entitySaga, client)
        .provide([[call([client, 'fetchAllDeployments'], options), Promise.resolve(entities)]])
        .put(fetchEntitiesSuccess(entities, options))
        .dispatch(fetchEntitiesRequest(options))
        .run({ silenceTimeout: true })
    })
  })
})
