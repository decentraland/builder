import { takeLatest, select, put } from 'redux-saga/effects'
import { getCurrentScene } from 'modules/scene/selectors'
import { writeGLTFComponents, writeEntities } from 'modules/scene/writers'
import { ADD_ENTITY } from 'modules/scene/actions'
import { getAssetMappings } from 'modules/asset/selectors'
import { BIND_EDITOR_KEYBOARD_SHORTCUTS, UNBIND_KEYBOARD_SHORTCUTS } from './actions'
import { bindKeyboardShortcuts, unbindKeyboardShortcuts } from 'modules/keyboard/action'
import { KeyboardShortcut } from 'modules/keyboard/types'
const ecs = require('raw-loader!decentraland-ecs/dist/src/index')

export function* editorSaga() {
  yield takeLatest(BIND_EDITOR_KEYBOARD_SHORTCUTS, handleBindEditorKeyboardShortcuts)
  yield takeLatest(UNBIND_KEYBOARD_SHORTCUTS, handleUnbindEditorKeyboardShortcuts)
  yield takeLatest(ADD_ENTITY, handleUpdate)
}

function* handleBindEditorKeyboardShortcuts() {
  const shortcuts = getKeyboardShortcuts()
  yield put(bindKeyboardShortcuts(shortcuts))
}

function* handleUnbindEditorKeyboardShortcuts() {
  const shortcuts = getKeyboardShortcuts()
  yield put(unbindKeyboardShortcuts(shortcuts))
}

function getKeyboardShortcuts(): KeyboardShortcut[] {
  return [
    { combination: ['cmd+z', 'ctrl+z'], callback: () => false },
    { combination: ['cmd+shift+z', 'ctrl+shift+z'], callback: () => false }
  ]
}

function* handleUpdate() {
  // TODO: Type this Scene
  const scene = yield select(getCurrentScene)
  const assetMappings = yield select(getAssetMappings)

  if (scene) {
    const entities = scene.entities
    const components = scene.components
    const ownScript = writeGLTFComponents(components) + writeEntities(entities, components)
    const script = ecs + ownScript
    const mappings = {
      'game.js': `data:application/javascript;base64,${btoa(script)}`,
      ...assetMappings
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
