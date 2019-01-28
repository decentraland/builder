import { takeLatest, select, put, call } from 'redux-saga/effects'

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
  UPDATE_EDITOR,
  CLOSE_EDITOR
} from 'modules/editor/actions'
import { PROVISION_SCENE, updateMetrics, updateComponent, UPDATE_TRANSFORM } from 'modules/scene/actions'
import { bindKeyboardShortcuts, unbindKeyboardShortcuts } from 'modules/keyboard/actions'
import { getCurrentScene, getEntityComponents } from 'modules/scene/selectors'
import { getAssetMappings } from 'modules/asset/selectors'
import { getCurrentProject } from 'modules/project/selectors'
import { getEditorScene } from 'modules/editor/utils'
import { KeyboardShortcut } from 'modules/keyboard/types'
import { SceneDefinition, SceneMetrics, ComponentType } from 'modules/scene/types'
import { Project } from 'modules/project/types'
import { EditorScene as EditorPayloadScene } from 'modules/editor/types'
import { store } from 'modules/common/store'
import { AssetMappings } from 'modules/asset/types'
import { RootState, Vector3, Quaternion } from 'modules/common/types'
import { EditorWindow } from 'components/Preview/Preview.types'

export function* editorSaga() {
  yield takeLatest(BIND_EDITOR_KEYBOARD_SHORTCUTS, handleBindEditorKeyboardShortcuts)
  yield takeLatest(UNBIND_KEYBOARD_SHORTCUTS, handleUnbindEditorKeyboardShortcuts)
  yield takeLatest(PROVISION_SCENE, handleProvisionScene)
  yield takeLatest(START_EDITOR, handleApplyEditorState)
  yield takeLatest(EDITOR_UNDO, handleApplyEditorState)
  yield takeLatest(EDITOR_REDO, handleApplyEditorState)
  yield takeLatest(UPDATE_EDITOR, handleUpdateEditor)
  yield takeLatest(START_EDITOR, handleStartEditor)
  yield takeLatest(CLOSE_EDITOR, handleCloseEditor)
  yield takeLatest(UPDATE_TRANSFORM, handleApplyEditorState)
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

  // @ts-ignore: Client api
  yield call(() => window['editor']['handleMessage'](msg))
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
  yield call(() => (window as EditorWindow).editor.on('metrics', handleMetricsChange))
  // The client will report the deltas when the transform of an entity has changed (gizmo movement)
  yield call(() => (window as EditorWindow).editor.on('transform', handlePositionGizmoUpdate))
}

function* handleCloseEditor() {
  yield call(() => (window as EditorWindow).editor.off('metrics', handleMetricsChange))
}
