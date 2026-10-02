import { expectSaga } from 'redux-saga-test-plan'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { AuthIdentity } from '@dcl/crypto'
import { BuilderAPI } from 'lib/api/builder'
import { loginSuccess } from 'modules/identity/actions'
import { toCrdt } from 'modules/inspector/utils'
import { getSceneByProjectId } from 'modules/scene/utils'
import { Scene } from 'modules/scene/types'
import { exportProjectRequest, loadProjectsRequest } from './actions'
import { projectSaga } from './sagas'
import { Project } from './types'

jest.mock('modules/scene/utils', () => ({ getSceneByProjectId: jest.fn() }))
jest.mock('modules/inspector/utils', () => ({ toComposite: jest.fn(), toCrdt: jest.fn(), toMappings: jest.fn() }))
jest.mock('./export', () => ({ createFiles: jest.fn(), createSDK7Files: jest.fn() }))
jest.mock('lib/zip', () => ({ downloadZip: jest.fn() }))

const builderAPI = {} as unknown as BuilderAPI

describe('when handling the loginSuccess action', () => {
  let wallet: Wallet
  let identity: AuthIdentity

  beforeEach(() => {
    wallet = { address: '0xa' } as Wallet
    identity = {} as AuthIdentity
  })

  it('should put a loadProjectsRequest action', () => {
    return expectSaga(projectSaga, builderAPI)
      .put(loadProjectsRequest())
      .dispatch(loginSuccess(wallet, identity))
      .run({ silenceTimeout: true })
  })
})

describe('when handling the exportProjectRequest action', () => {
  let project: Project
  let scene: Scene

  beforeEach(() => {
    project = { id: 'project-id', title: 'Project', layout: { rows: 2, cols: 3 } } as Project
    scene = { sdk6: { id: 'scene-id', entities: {}, components: {}, assets: {} } } as unknown as Scene
    ;(getSceneByProjectId as jest.Mock).mockReturnValue(scene)
    ;(toCrdt as jest.Mock).mockReturnValue(new Uint8Array())
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('and the SDK6 scene is being migrated to SDK7', () => {
    it('should build the crdt with the project so its layout matches the exported composite', () => {
      return expectSaga(projectSaga, builderAPI)
        .dispatch(exportProjectRequest(project, true))
        .run({ silenceTimeout: true })
        .then(() => {
          expect(toCrdt).toHaveBeenCalledWith(scene.sdk6, project)
        })
    })
  })
})
