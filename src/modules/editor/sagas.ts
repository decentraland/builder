import { takeLatest, select, put, call } from 'redux-saga/effects'
import { delay } from 'redux-saga'

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
import { PROVISION_SCENE, updateMetrics, updateComponent, UPDATE_TRANSFORM, ADD_ASSET } from 'modules/scene/actions'
import { bindKeyboardShortcuts, unbindKeyboardShortcuts } from 'modules/keyboard/actions'
import { getCurrentScene, getEntityComponents } from 'modules/scene/selectors'
import { getAssetMappings } from 'modules/asset/selectors'
import { getCurrentProject } from 'modules/project/selectors'
import { KeyboardShortcut } from 'modules/keyboard/types'
import { SceneDefinition, SceneMetrics, ComponentType } from 'modules/scene/types'
import { Project } from 'modules/project/types'
import { EditorScene as EditorPayloadScene } from 'modules/editor/types'
import { store } from 'modules/common/store'
import { AssetMappings } from 'modules/asset/types'
import { RootState, Vector3, Quaternion } from 'modules/common/types'
import { EditorWindow } from 'components/Preview/Preview.types'
import { getNewScene } from './utils'

const editorWindow = window as EditorWindow

export function* editorSaga() {
  yield takeLatest(BIND_EDITOR_KEYBOARD_SHORTCUTS, handleBindEditorKeyboardShortcuts)
  yield takeLatest(UNBIND_KEYBOARD_SHORTCUTS, handleUnbindEditorKeyboardShortcuts)
  yield takeLatest(PROVISION_SCENE, handleApplyEditorState)
  yield takeLatest(EDITOR_UNDO, handleApplyEditorState)
  yield takeLatest(EDITOR_REDO, handleApplyEditorState)
  yield takeLatest(UPDATE_TRANSFORM, handleApplyEditorState)
  yield takeLatest(START_EDITOR, handleStartEditor)
  yield takeLatest(UPDATE_EDITOR, handleUpdateEditor)
  yield takeLatest(CLOSE_EDITOR, handleCloseEditor)
  yield takeLatest(ADD_ASSET, handleApplyEditorState)
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
  yield call(() => editorWindow.editor.handleMessage(msg))
}

function* handleApplyEditorState() {
  const scene: SceneDefinition = yield select(getCurrentScene)

  if (scene) {
    const assetMappings: AssetMappings = yield select(getAssetMappings)

    yield handleUpdateEditor(updateEditor(scene.id, scene, assetMappings))
  }
}

function handleMetricsChange(args: { metrics: SceneMetrics; limits: SceneMetrics }) {
  const { metrics, limits } = args
  const scene = getCurrentScene(store.getState() as RootState)
  if (scene) {
    store.dispatch(updateMetrics(scene.id, metrics, limits))
  }
}

function handlePositionGizmoUpdate(args: { entityId: string; transform: { position: Vector3; rotation: Quaternion; scale: Vector3 } }) {
  const scene = getCurrentScene(store.getState() as RootState)
  const components = getEntityComponents(args.entityId)(store.getState() as RootState)
  const transform = Object.values(components).find(component => component.type === ComponentType.Transform)

  if (transform) {
    store.dispatch(updateComponent(scene.id, transform.id, { position: args.transform.position, rotation: args.transform.rotation }))
  } else {
    console.warn(`Unable to find Transform component for ${args.entityId}`)
  }
}

function* handleStartEditor() {
  // Creates a new scene in the dcl client's side
  yield handleNewScene()

  // TODO: find a better way to wait for the editor to be ready
  yield delay(3000)

  // Spawns the assets
  yield handleApplyEditorState()

  // Handles subscriptions to metrics
  yield call(() => editorWindow.editor.on('metrics', handleMetricsChange))

  // The client will report the deltas when the transform of an entity has changed (gizmo movement)
  yield call(() => editorWindow.editor.on('transform', handlePositionGizmoUpdate))
}

function* handleCloseEditor() {
  yield call(() => editorWindow.editor.off('metrics', handleMetricsChange))
}

/**
 * This function sends the update actions to the editor.
 */
function* handleUpdateEditor(action: UpdateEditorAction) {
  // @ts-ignore: Client api
  yield call(() => editorWindow.editor.sendExternalAction(action))
}
