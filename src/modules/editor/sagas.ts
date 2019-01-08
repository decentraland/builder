import { all, takeLatest, select } from 'redux-saga/effects'
import { ADD_ENTITY } from 'modules/entity/actions'
import { getData as getEntities } from 'modules/entity/selectors'
import { getData as getComponents } from 'modules/component/selectors'
import { getData as getScenes } from 'modules/scene/selectors'
import { getData as getProjects } from 'modules/project/selectors'
import { writeGLTFComponents, writeEntities } from 'modules/scene/writers'
import { getProjectId } from 'modules/location/selectors'
import { Project } from 'modules/project/types'
import { SceneState } from 'modules/scene/reducer'
import { SceneDefinition } from 'modules/scene/types'
import { EntityState } from 'modules/entity/reducer'
import { ComponentState } from 'modules/component/reducer'
import { createSelector } from 'reselect'
const ecs = require('raw-loader!decentraland-ecs/dist/src/index')

function* watchTreeUpdate() {
  yield takeLatest(ADD_ENTITY, handleUpdate)
}

function* handleUpdate() {
  const projects = yield select(getProjects)
  const projectId = getProjectId()
  const project: Project | null = projectId ? projects[projectId] : null

  if (project) {
    const scenes: SceneState['data'] = yield select(getScenes)
    const scene: SceneDefinition = scenes[project.sceneId]
    // TODO: we probably need to handle missing scenes in the future
    const allEntities: EntityState['data'] = yield select(getEntities)
    const allComponents: ComponentState['data'] = yield select(getComponents)

    const entities = scene.entities.reduce((acc, entityId) => {
      return { ...acc, [entityId]: allEntities[entityId] }
    }, {})

    const components = scene.entities.reduce((acc, componentId) => {
      return { ...acc, [componentId]: allComponents[componentId] }
    }, {})

    const ownScript = writeGLTFComponents(components) + writeEntities(entities, components)
    const script = ecs + ownScript
    const mappings = {
      'game.js': `data:application/javascript;base64,${btoa(script)}`
    }

    const msg = {
      type: 'update',
      payload: {
        scene: {
          display: {
            title: 'Project' // TODO use project name
          },
          owner: 'Decentraland',
          contact: {
            name: 'Decentraland',
            email: 'support@decentraland.org'
          },
          scene: {
            parcels: ['0,0'],
            base: '0,0'
          },
          communications: {
            type: 'webrtc',
            signalling: 'https://rendezvous.decentraland.org'
          },
          policy: {
            fly: true,
            voiceEnabled: true,
            blacklist: [],
            teleportPosition: '0,0,0'
          },
          main: 'game.js',
          _mappings: mappings
        }
      }
    }

    // @ts-ignore: Client api
    window['editor']['handleServerMessage'](msg)
  } else {
    // TODO: dispatch a proper 404 error message
  }
}

export default function* editorSaga() {
  yield all([watchTreeUpdate()])
}
