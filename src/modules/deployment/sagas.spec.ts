import { CatalystClient, createCatalystClient, createContentClient } from 'dcl-catalyst-client'
import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { call, select } from 'redux-saga/effects'
import { AuthIdentity } from '@dcl/crypto'
import { buildEntity } from 'dcl-catalyst-client/dist/client/utils/DeploymentBuilder'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { DataByKey } from 'decentraland-dapps/dist/lib/types'
import cryptoFetch from 'decentraland-crypto-fetch'
import { config } from 'config'
import { BuilderAPI } from 'lib/api/builder'
import { getCatalystContentUrl } from 'lib/api/peer'
import { isLoggedIn } from 'modules/identity/selectors'
import { getIdentity } from 'modules/identity/utils'
import { getMedia } from 'modules/media/selectors'
import { objectURLToBlob } from 'modules/media/utils'
import { getName } from 'modules/profile/selectors'
import { getData } from 'modules/project/selectors'
import { getData as getDeployments } from 'modules/deployment/selectors'
import { createFiles } from 'modules/project/export'
import { getSceneByProjectId } from 'modules/scene/utils'
import {
  clearDeploymentFailure,
  clearDeploymentRequest,
  clearDeploymentSuccess,
  deployToWorldRequest,
  fetchWorldDeploymentsRequest,
  fetchWorldDeploymentsSuccess
} from './actions'
import { deploymentSaga } from './sagas'
import { makeContentFiles } from './contentUtils'
import { Deployment } from './types'

let builderAPI: BuilderAPI
let catalystClient: CatalystClient
let deployMock: jest.Mock
let fetchEntitiesByPointersMock: jest.Mock

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
  builderAPI = {
    uploadMedia: jest.fn()
  } as unknown as BuilderAPI
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

describe('when handling deploy to world request', () => {
  it('should upload media', () => {
    const projectId = 'project-id'
    return expectSaga(deploymentSaga, builderAPI, catalystClient)
      .provide([
        [matchers.select(getData), { [projectId]: { id: projectId } }],
        [matchers.call.fn(getSceneByProjectId), { sdk6: {} }],
        [matchers.call.fn(getIdentity), {}],
        [matchers.select(getName), 'author'],
        [matchers.select(getMedia), { north: 'north', south: 'south', east: 'east', west: 'west', preview: 'preview' }],
        [matchers.select(isLoggedIn), true],
        [matchers.call.fn(objectURLToBlob), {}]
      ])
      .call.like({ fn: builderAPI.uploadMedia })
      .dispatch(deployToWorldRequest('project-id', 'world-name'))
      .silentRun()
  })

  it('should build and deploy scene with correct parameters', () => {
    const projectId = 'project-id'
    const sceneDefinition = { scene: { parcels: [] } }
    return expectSaga(deploymentSaga, builderAPI, catalystClient)
      .provide([
        [matchers.select(getData), { [projectId]: { id: projectId } }],
        [matchers.call.fn(getSceneByProjectId), { sdk6: {} }],
        [matchers.call.fn(getIdentity), {}],
        [matchers.select(getName), 'author'],
        [matchers.select(getMedia), { north: 'north', south: 'south', east: 'east', west: 'west', preview: 'preview' }],
        [matchers.select(isLoggedIn), true],
        [matchers.select(getAddress), 'address'],
        [matchers.call.fn(objectURLToBlob), {}],
        [matchers.call.fn(createFiles), { 'scene.json': JSON.stringify(sceneDefinition) }],
        [matchers.call.fn(makeContentFiles), {}],
        [matchers.call.fn(buildEntity), { entityId: 'entityId', files: [] }]
      ])
      .call.like({ fn: buildEntity, args: [{ type: 'scene', pointers: [], metadata: sceneDefinition, files: {} }] })
      .call.like({ fn: deployMock, args: [{ entityId: 'entityId', files: [], authChain: 'auth' }] })
      .dispatch(deployToWorldRequest('project-id', 'world-name'))
      .silentRun()
  })
})

describe('when handling fetch worlds deployments request', () => {
  it('should fetch deployments for each world', () => {
    const worlds = ['my-world.dcl.eth']
    return expectSaga(deploymentSaga, builderAPI, catalystClient)
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
      await expectSaga(deploymentSaga, builderAPI, catalystClient)
        .provide([[select(getDeployments), deployments]])
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
        await expectSaga(deploymentSaga, builderAPI, catalystClient)
          .provide([
            [select(getDeployments), deployments],
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
            await expectSaga(deploymentSaga, builderAPI, catalystClient)
              .provide([
                [select(getDeployments), deployments],
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
            await expectSaga(deploymentSaga, builderAPI, catalystClient)
              .provide([
                [select(getDeployments), deployments],
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
