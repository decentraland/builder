import { takeLatest, select, put, call } from 'redux-saga/effects'

import { getCurrentScene } from 'modules/scene/selectors'
import { getAssetMappings } from 'modules/asset/selectors'
import { PROVISION_SCENE } from 'modules/scene/actions'
import { bindKeyboardShortcuts, unbindKeyboardShortcuts } from 'modules/keyboard/actions'
import { getCurrentProject } from 'modules/project/selectors'
import { KeyboardShortcut } from 'modules/keyboard/types'
import { SceneDefinition } from 'modules/scene/types'
import { Project } from 'modules/project/types'
import { EditorScene as EditorPayloadScene } from 'modules/editor/types'
import { store } from 'modules/common/store'
import { AssetMappings } from 'modules/asset/types'
import {
  updateEditor,
  UpdateEditorAction,
  editorUndo,
  editorRedo,
  BIND_EDITOR_KEYBOARD_SHORTCUTS,
  UNBIND_KEYBOARD_SHORTCUTS,
  START_EDITOR,
  EDITOR_UNDO,
  EDITOR_REDO,
  UPDATE_EDITOR
} from 'modules/editor/actions'
import { getEditorScene } from './utils'

export function* editorSaga() {
  yield subscribeToMetrics()
  yield takeLatest(BIND_EDITOR_KEYBOARD_SHORTCUTS, handleBindEditorKeyboardShortcuts)
  yield takeLatest(UNBIND_KEYBOARD_SHORTCUTS, handleUnbindEditorKeyboardShortcuts)
  yield takeLatest(PROVISION_SCENE, handleProvisionScene)
  yield takeLatest(START_EDITOR, handleApplyEditorState)
  yield takeLatest(EDITOR_UNDO, handleApplyEditorState)
  yield takeLatest(EDITOR_REDO, handleApplyEditorState)
  yield takeLatest(UPDATE_EDITOR, handleUpdateEditor)
}

function* handleBindEditorKeyboardShortcuts() {
  const shortcuts = getKeyboardShortcuts()
  yield put(bindKeyboardShortcuts(shortcuts))
}

function* handleUnbindEditorKeyboardShortcuts() {
  const shortcuts = getKeyboardShortcuts()
  yield put(unbindKeyboardShortcuts(shortcuts))
}

// This function dispatches actions to the store, but uses `store.dispatch` to scape generators
function getKeyboardShortcuts(): KeyboardShortcut[] {
  return [
    {
      combination: ['command+z', 'ctrl+z'],
      callback: () => store.dispatch(editorUndo())
    },
    {
      combination: ['command+shift+z', 'ctrl+shift+z'],
      callback: () => store.dispatch(editorRedo())
    }
  ]
}

function* handleProvisionScene() {
  const scene: SceneDefinition = yield select(getCurrentScene)

  if (scene) {
    const project: Project = yield select(getCurrentProject)
    const assetMappings: AssetMappings = yield select(getAssetMappings)
    const newScene: EditorPayloadScene = getEditorScene(project.title, scene, assetMappings)

    yield put(updateEditor(scene.id, newScene))
  } else {
    // TODO: dispatch a proper 404 error message
    console.warn('Invalid scene')
  }
}

function* handleApplyEditorState() {
  const scene: SceneDefinition = yield select(getCurrentScene)

  if (scene) {
    const project: Project = yield select(getCurrentProject)
    const assetMappings: AssetMappings = yield select(getAssetMappings)
    const newScene: EditorPayloadScene = getEditorScene(project.title, scene, assetMappings)

    yield handleUpdateEditor(updateEditor(scene.id, newScene))
  }
}

function* handleUpdateEditor(action: UpdateEditorAction) {
  let payloadScene: EditorPayloadScene

  if (action.payload.scene) {
    payloadScene = action.payload.scene
  } else {
    const scene: SceneDefinition = yield select(getCurrentScene)
    const project: Project = yield select(getCurrentProject)
    const assetMappings: AssetMappings = {}
    payloadScene = getEditorScene(project.title, scene, assetMappings)
  }

  const msg = {
    type: 'update',
    payload: {
      scene: payloadScene
    }
  }

  console.log(msg)

  // @ts-ignore: Client api
  yield call(() => window['editor']['handleMessage'](msg))
}

function* subscribeToMetrics() {
  console.log('subscription enabled')
  yield call(() =>
    // @ts-ignore: Client api
    window['editor'].on('metrics', m => {
      console.log(m)
    })
  )
}
