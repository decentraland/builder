import { CatalystClient, ContentClient } from 'dcl-catalyst-client'
import { BuilderAPI } from 'lib/api/builder'
import { getName } from 'modules/profile/selectors'
import { isLoggedIn } from 'modules/identity/selectors'
import { getIdentity } from 'modules/identity/utils'
import { getData } from 'modules/project/selectors'
import { getSceneByProjectId } from 'modules/scene/utils'
import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { deployToWorldRequest } from './actions'
import { deploymentSaga } from './sagas'
import { getMedia } from 'modules/media/selectors'
import { objectURLToBlob } from 'modules/media/utils'
import { createFiles } from 'modules/project/export'
import { makeContentFiles } from './contentUtils'

let builderAPI: BuilderAPI
let catalystClient: CatalystClient

jest.mock('@dcl/crypto', () => ({
  Authenticator: { signPayload: jest.fn().mockReturnValue('auth') }
}))

beforeEach(() => {
  builderAPI = {
    uploadMedia: jest.fn()
  } as unknown as BuilderAPI
  catalystClient = {
    buildEntity: jest.fn(),
    deployEntity: jest.fn()
  } as unknown as CatalystClient
})

describe('when handling deploy to world request', () => {
  it('should upload media', () => {
    const projectId = 'project-id'
    return expectSaga(deploymentSaga, builderAPI, catalystClient)
      .provide([
        [matchers.select(getData), { [projectId]: { id: projectId } }],
        [matchers.call.fn(getSceneByProjectId), {}],
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
        [matchers.call.fn(getSceneByProjectId), {}],
        [matchers.call.fn(getIdentity), {}],
        [matchers.select(getName), 'author'],
        [matchers.select(getMedia), { north: 'north', south: 'south', east: 'east', west: 'west', preview: 'preview' }],
        [matchers.select(isLoggedIn), true],
        [matchers.call.fn(objectURLToBlob), {}],
        [matchers.call.fn(createFiles), { 'scene.json': JSON.stringify(sceneDefinition) }],
        [matchers.call.fn(makeContentFiles), {}],
        [matchers.call.fn(ContentClient.prototype.buildEntity), { entityId: 'entityId', files: [] }],
        [matchers.call.fn(ContentClient.prototype.deployEntity), {}]
      ])
      .call.like({ fn: ContentClient.prototype.buildEntity, args: [{ type: 'scene', pointers: [], metadata: sceneDefinition, files: {} }] })
      .call.like({ fn: ContentClient.prototype.deployEntity, args: [{ entityId: 'entityId', files: [], authChain: undefined }] })
      .dispatch(deployToWorldRequest('project-id', 'world-name'))
      .silentRun()
  })
})
