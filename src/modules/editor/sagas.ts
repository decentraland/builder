import { takeLatest, select, put, call } from 'redux-saga/effects'

import {
  updateEditor,
  editorUndo,
  editorRedo,
  BIND_EDITOR_KEYBOARD_SHORTCUTS,
  UNBIND_KEYBOARD_SHORTCUTS,
  START_EDITOR,
  EDITOR_UNDO,
  EDITOR_REDO,
  UPDATE_EDITOR,
  CLOSE_EDITOR,
  UpdateEditorAction
} from 'modules/editor/actions'

import { PROVISION_SCENE, updateMetrics, CREATE_SCENE, ADD_ASSET } from 'modules/scene/actions'
import { bindKeyboardShortcuts, unbindKeyboardShortcuts } from 'modules/keyboard/actions'
import { getCurrentScene } from 'modules/scene/selectors'
import { getAssetMappings } from 'modules/asset/selectors'
import { getCurrentProject } from 'modules/project/selectors'
import { KeyboardShortcut } from 'modules/keyboard/types'
import { SceneDefinition, SceneMetrics } from 'modules/scene/types'
import { Project } from 'modules/project/types'
import { EditorScene as EditorPayloadScene } from 'modules/editor/types'
import { store } from 'modules/common/store'
import { AssetMappings } from 'modules/asset/types'
import { RootState } from 'modules/common/types'
import { EditorWindow } from 'components/Preview/Preview.types'
import { getNewScene } from './utils'

export function* editorSaga() {
  yield takeLatest(BIND_EDITOR_KEYBOARD_SHORTCUTS, handleBindEditorKeyboardShortcuts)
  yield takeLatest(UNBIND_KEYBOARD_SHORTCUTS, handleUnbindEditorKeyboardShortcuts)
  yield takeLatest(PROVISION_SCENE, handleProvisionScene)
  yield takeLatest(START_EDITOR, handleApplyEditorState)
  yield takeLatest(EDITOR_UNDO, handleApplyEditorState)
  yield takeLatest(EDITOR_REDO, handleApplyEditorState)
  yield takeLatest(UPDATE_EDITOR, handleEditorAction)
  yield takeLatest(START_EDITOR, handleNewScene)
  yield takeLatest(START_EDITOR, handleStartEditor)
  yield takeLatest(CLOSE_EDITOR, handleCloseEditor)
  yield takeLatest(ADD_ASSET, handleEditorAction)
  yield takeLatest(CREATE_SCENE, handleEditorAction)
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

function* handleNewScene() {
  const project: Project = yield select(getCurrentProject)
  const newScene: EditorPayloadScene = getNewScene(project.title)

  const msg = {
    type: 'update',
    payload: {
      scene: newScene
    }
  }

  // @ts-ignore: Client api
  yield call(() => window['editor']['handleMessage'](msg))
}

function* handleProvisionScene() {
  const scene: SceneDefinition = yield select(getCurrentScene)

  if (scene) {
    const assetMappings: AssetMappings = yield select(getAssetMappings)

    yield put(updateEditor(scene.id, scene, assetMappings))
  } else {
    // TODO: dispatch a proper 404 error message
    console.warn('Invalid scene')
  }
}

function* handleApplyEditorState() {
  const scene: SceneDefinition = yield select(getCurrentScene)

  if (scene) {
    const assetMappings: AssetMappings = yield select(getAssetMappings)

    yield handleEditorAction(updateEditor(scene.id, scene, assetMappings))
  }
}

function handleMetricsChange(args: { metrics: SceneMetrics; limits: SceneMetrics }) {
  const { metrics, limits } = args
  const scene = getCurrentScene(store.getState() as RootState)
  if (scene) {
    store.dispatch(updateMetrics(scene.id, metrics, limits))
  }
}

function* handleStartEditor() {
  yield call(() => (window as EditorWindow).editor.on('metrics', handleMetricsChange))
}

function* handleCloseEditor() {
  yield call(() => (window as EditorWindow).editor.off('metrics', handleMetricsChange))
}

/**
 * This function sends the update actions to the editor.
 */
function* handleEditorAction(action: UpdateEditorAction) {
  // @ts-ignore: Client api
  yield call(() => window['editor']['sendExternalAction'](action))
}
