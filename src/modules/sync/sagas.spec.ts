import { expectSaga } from 'redux-saga-test-plan'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { AuthIdentity } from '@dcl/crypto'
import { AnyAction } from 'redux'
import { BuilderAPI } from 'lib/api/builder'
import { loginSuccess } from 'modules/identity/actions'
import { isLoggedIn } from 'modules/identity/selectors'
import { setProject } from 'modules/project/actions'
import { getCurrentProject } from 'modules/project/selectors'
import { Project } from 'modules/project/types'
import { provisionScene, updateScene } from 'modules/scene/actions'
import { SceneSDK6, SceneSDK7 } from 'modules/scene/types'
import { syncSaga } from './sagas'

type Trigger = [string, (project: Project) => AnyAction]

const TRIGGERS: Trigger[] = [
  ['logging in', () => loginSuccess({ address: '0xa' } as Wallet, {} as AuthIdentity)],
  ['changing a project', project => setProject(project)],
  ['editing an SDK6 scene', () => provisionScene({ id: 'scene-id' } as SceneSDK6)],
  ['editing an SDK7 scene', () => updateScene({ id: 'scene-id' } as SceneSDK7)]
]

describe('when a signed in user has projects stored in the browser', () => {
  let builderAPI: BuilderAPI
  let project: Project
  let state: Record<string, unknown>

  beforeEach(() => {
    builderAPI = {} as unknown as BuilderAPI
    project = { id: 'project-id', sceneId: 'scene-id', thumbnail: '' } as Project
    state = {
      project: { data: { [project.id]: project } },
      scene: { present: { data: {} } },
      sync: { project: { localIds: [project.id], loadingIds: [], errorsById: {} } }
    }
  })

  describe.each(TRIGGERS)('and %s', (_, buildAction) => {
    it('should not queue any action to upload the projects to the builder server', async () => {
      const { effects } = await expectSaga(syncSaga, builderAPI)
        .withState(state)
        .provide({
          select({ selector }, next) {
            if (selector === isLoggedIn) return true
            if (selector === getCurrentProject) return project
            return next()
          }
        })
        .dispatch(buildAction(project))
        .run({ silenceTimeout: true })

      expect(effects.put).toBeUndefined()
    })
  })
})
