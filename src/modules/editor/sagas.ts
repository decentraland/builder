import { all, takeLatest, select } from 'redux-saga/effects'
import { getCurrentScene } from 'modules/scene/selectors'
import { writeGLTFComponents, writeEntities } from 'modules/scene/writers'
import { ADD_ENTITY } from 'modules/scene/actions'
const ecs = require('raw-loader!decentraland-ecs/dist/src/index')

function* watchTreeUpdate() {
  yield takeLatest(ADD_ENTITY, handleUpdate)
}

function* handleUpdate() {
  // TODO: Type this Scene
  const scene = yield select(getCurrentScene)

  if (scene) {
    const entities = scene.entities
    const components = scene.components
    const ownScript = writeGLTFComponents(components) + writeEntities(entities, components)
    const script = ecs + ownScript
    const mappings = {
      'game.js': `data:application/javascript;base64,${btoa(script)}`
      // TODO: add asset mappings here
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

export function* editorSaga() {
  yield all([watchTreeUpdate()])
}
