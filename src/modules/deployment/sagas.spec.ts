import { CatalystClient, createCatalystClient, createContentClient } from 'dcl-catalyst-client'
import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { call, select } from 'redux-saga/effects'
import { AuthIdentity } from '@dcl/crypto'
import { DataByKey } from 'decentraland-dapps/dist/lib/types'
import cryptoFetch from 'decentraland-crypto-fetch'
import { config } from 'config'
import { getCatalystContentUrl } from 'lib/api/peer'
import { getIdentity } from 'modules/identity/utils'
import { getData as getDeployments } from 'modules/deployment/selectors'
import { getLandTiles } from 'modules/land/selectors'
import {
  clearDeploymentFailure,
  clearDeploymentRequest,
  clearDeploymentSuccess,
  fetchWorldDeploymentsRequest,
  fetchWorldDeploymentsSuccess
} from './actions'
import { deploymentSaga } from './sagas'
import { Deployment } from './types'

let catalystClient: CatalystClient
let deployMock: jest.Mock
let fetchEntitiesByPointersMock: jest.Mock

// Mocking store as when the store gets loaded, it runs the default sagas
jest.mock('modules/common/store', () => ({
  store: {
    dispatch: jest.fn()
  }
}))

jest.mock('@dcl/crypto', () => ({
  Authenticator: { signPayload: jest.fn().mockReturnValue('auth') }
}))
jest.mock('dcl-catalyst-client/dist/client/utils/DeploymentBuilder', () => ({
  buildEntity: jest.fn()
}))

jest.mock('dcl-catalyst-client', () => ({
  createCatalystClient: jest.fn(),
  createContentClient: jest.fn()
}))

beforeEach(() => {
  deployMock = jest.fn()
  fetchEntitiesByPointersMock = jest.fn()

  const getContentClientMock = jest.fn().mockResolvedValue({
    deploy: deployMock,
    fetchEntitiesByPointers: fetchEntitiesByPointersMock
  })
  catalystClient = {
    getContentClient: getContentClientMock
  } as unknown as CatalystClient
  ;(createCatalystClient as jest.Mock).mockReturnValue({
    getContentClient: getContentClientMock
  })
  ;(createContentClient as jest.Mock).mockReturnValue({
    deploy: deployMock,
    fetchEntitiesByPointers: fetchEntitiesByPointersMock
  })
})

describe('when handling fetch worlds deployments request', () => {
  it('should fetch deployments for each world', () => {
    const worlds = ['my-world.dcl.eth']
    return expectSaga(deploymentSaga, catalystClient)
      .provide([
        [
          matchers.call.fn(fetchEntitiesByPointersMock),
          [
            {
              id: 'deployMyWorldId',
              timestamp: 1,
              pointers: ['0,0'],
              content: [{ file: 'scene-thumbnail.png', hash: 'aThumbnailHash' }],
              metadata: {
                display: { title: 'MySceneName', navmapThumbnail: 'scene-thumbnail.png' },
                scene: { base: '0,0', parcels: ['0,0', '0,1', '1,0', '1,1'] },
                source: { projectId: 'aProjectId', layout: { rows: 2, cols: 2 } },
                owner: '',
                worldConfiguration: {
                  name: worlds[0]
                }
              }
            }
          ]
        ]
      ])
      .put(
        fetchWorldDeploymentsSuccess(worlds, [
          {
            id: 'deployMyWorldId',
            timestamp: 1,
            projectId: 'aProjectId',
            name: 'MySceneName',
            thumbnail: getCatalystContentUrl('aThumbnailHash'),
            placement: { point: { x: 0, y: 0 }, rotation: 'north' },
            owner: '',
            layout: { rows: 2, cols: 2 },
            base: '0,0',
            parcels: ['0,0', '0,1', '1,0', '1,1'],
            world: worlds[0]
          }
        ] as unknown as Deployment[])
      )
      .dispatch(fetchWorldDeploymentsRequest(worlds))
      .silentRun()
  })
})

describe('when handling the clear deployment request action', () => {
  let deploymentId: string
  let identity: AuthIdentity | null
  let deployments: DataByKey<Deployment>
  let crytoFetchResponse: Response

  beforeEach(() => {
    deploymentId = 'deploymentId'
    identity = null
    deployments = {}
    crytoFetchResponse = { ok: false, status: 500 } as Response
  })

  describe('when the stored deployments does not contain a deployment for the provided id', () => {
    it('should put a clear deployment failure action signaling that the deployment id is invalid', async () => {
      await expectSaga(deploymentSaga, catalystClient)
        .provide([
          [select(getDeployments), deployments],
          [select(getLandTiles), []]
        ])
        .put(clearDeploymentFailure(deploymentId, 'Unable to clear deployment: Invalid deployment'))
        .dispatch(clearDeploymentRequest(deploymentId))
        .silentRun()
    })
  })

  describe('when the stored deployments does contain a deployment for the provided id', () => {
    beforeEach(() => {
      deployments[deploymentId] = {} as Deployment
    })

    describe('when getting the identity returns a null or undefined value', () => {
      it('should put a clear deployment failure action signaling that the identity cannot be obtained', async () => {
        await expectSaga(deploymentSaga, catalystClient)
          .provide([
            [select(getDeployments), deployments],
            [select(getLandTiles), []],
            [call(getIdentity), identity]
          ])
          .put(clearDeploymentFailure(deploymentId, 'Unable to clear deployment: Invalid identity'))
          .dispatch(clearDeploymentRequest(deploymentId))
          .silentRun()
      })
    })

    describe('when getting the identity returns an identity', () => {
      beforeEach(() => {
        identity = {} as AuthIdentity
      })

      describe('when the stored deployment is for a world', () => {
        let worldsContentServerUrl: string

        beforeEach(() => {
          deployments[deploymentId].world = 'world'
          worldsContentServerUrl = 'https://worlds-content-server.com'
          jest.spyOn(config, 'get').mockReturnValueOnce(worldsContentServerUrl)
        })

        describe('when the crypto fetch response is not ok', () => {
          it('should put a clear deployment failure action signaling that the response is not ok', async () => {
            await expectSaga(deploymentSaga, catalystClient)
              .provide([
                [select(getDeployments), deployments],
                [select(getLandTiles), []],
                [call(getIdentity), identity],
                [
                  call(cryptoFetch, `${worldsContentServerUrl}/entities/world`, {
                    method: 'DELETE',
                    identity: identity!
                  }),
                  crytoFetchResponse
                ]
              ])
              .put(clearDeploymentFailure(deploymentId, `Unable to clear deployment: Response is not ok, status 500`))
              .dispatch(clearDeploymentRequest(deploymentId))
              .silentRun()
          })
        })

        describe('when the crypto fetch response is ok', () => {
          beforeEach(() => {
            crytoFetchResponse = { ok: true } as Response
          })

          it('should put a clear deployment success action signaling that the clear deployment executed successfuly', async () => {
            await expectSaga(deploymentSaga, catalystClient)
              .provide([
                [select(getDeployments), deployments],
                [select(getLandTiles), []],
                [call(getIdentity), identity],
                [
                  call(cryptoFetch, `${worldsContentServerUrl}/entities/world`, {
                    method: 'DELETE',
                    identity: identity!
                  }),
                  crytoFetchResponse
                ]
              ])
              .put(clearDeploymentSuccess(deploymentId))
              .dispatch(clearDeploymentRequest(deploymentId))
              .silentRun()
          })
        })
      })
    })
  })
})
