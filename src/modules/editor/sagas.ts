import { takeLatest, select, put, call } from 'redux-saga/effects'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'

import {
  updateEditor,
  editorUndo,
  editorRedo,
  BIND_EDITOR_KEYBOARD_SHORTCUTS,
  UNBIND_KEYBOARD_SHORTCUTS,
  EDITOR_UNDO,
  EDITOR_REDO,
  UPDATE_EDITOR,
  CLOSE_EDITOR,
  UpdateEditorAction,
  SET_MODE,
  SetModeAction,
  TogglePreviewAction,
  TOGGLE_PREVIEW,
  TOGGLE_SIDEBAR,
  ToggleSidebarAction,
  ZOOM_IN,
  ZOOM_OUT,
  RESET_CAMERA,
  resetCamera,
  zoomIn,
  zoomOut,
  setMode,
  OPEN_EDITOR,
  setEditorReady
} from 'modules/editor/actions'
import { PROVISION_SCENE, updateMetrics, updateTransform, UPDATE_TRANSFORM, ADD_ASSET } from 'modules/scene/actions'
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
  yield takeLatest(UPDATE_EDITOR, handleUpdateEditor)
  yield takeLatest(OPEN_EDITOR, handleOpenEditor)
  yield takeLatest(CLOSE_EDITOR, handleCloseEditor)
  yield takeLatest(ADD_ASSET, handleApplyEditorState)
  yield takeLatest(SET_MODE, handleSetMode)
  yield takeLatest(TOGGLE_PREVIEW, handleTooglePreview)
  yield takeLatest(TOGGLE_SIDEBAR, handleToggleSidebar)
  yield takeLatest(ZOOM_IN, handleZoomIn)
  yield takeLatest(ZOOM_OUT, handleZoomOut)
  yield takeLatest(RESET_CAMERA, handleResetCamera)
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
      combination: ['m'],
      callback: () => store.dispatch(setMode('move'))
    },
    {
      combination: ['r'],
      callback: () => store.dispatch(setMode('rotate'))
    },
    {
      combination: ['command+z', 'ctrl+z'],
      callback: () => store.dispatch(editorUndo())
    },
    {
      combination: ['command+shift+z', 'ctrl+shift+z'],
      callback: () => store.dispatch(editorRedo())
    },
    {
      combination: ['?'],
      callback: () => store.dispatch(openModal('ShortcutsModal'))
    },
    {
      combination: ['space'],
      callback: () => store.dispatch(resetCamera())
    },
    {
      combination: ['shift+='],
      callback: () => store.dispatch(zoomIn())
    },
    {
      combination: ['shift+-'],
      callback: () => store.dispatch(zoomOut())
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

  const sanitizedPosition = {
    ...args.transform.position,
    y: args.transform.position.y < 0 ? 0 : args.transform.position.y
  }

  if (transform) {
    store.dispatch(updateTransform(scene.id, transform.id, { position: sanitizedPosition, rotation: args.transform.rotation }))
  } else {
    console.warn(`Unable to find Transform component for ${args.entityId}`)
  }
}

function* handleOpenEditor() {
  // Handles subscriptions to metrics
  yield call(() => editorWindow.editor.on('metrics', handleMetricsChange))

  // The client will report the deltas when the transform of an entity has changed (gizmo movement)
  yield call(() => editorWindow.editor.on('transform', handlePositionGizmoUpdate))

  // The client will report when the internal api is ready
  yield call(() => editorWindow.editor.on('ready', handleEditorReadyChange))

  // Creates a new scene in the dcl client's side
  yield handleNewScene()

  // Spawns the assets
  yield handleApplyEditorState()
}

function handleEditorReadyChange() {
  store.dispatch(setEditorReady())
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

function* handleSetMode(action: SetModeAction) {
  switch (action.payload.mode) {
    case 'move': {
      // TODO: set move mode
      break
    }
    case 'rotate': {
      // TODO: set rotate mode
      break
    }
    case 'select': {
      // TODO: set scale mode
      break
    }
  }
  // TODO: remove this after doing the TODOs above
  yield 1
}

function resizeEditor() {
  const { editor } = window as EditorWindow
  window.requestAnimationFrame(() => editor.resize())
}

function* handleTooglePreview(action: TogglePreviewAction) {
  yield call(() => {
    const { editor } = window as EditorWindow
    editor.setPlayMode(action.payload.enabled)
    resizeEditor()
  })
}

function* handleToggleSidebar(action: ToggleSidebarAction) {
  yield call(() => resizeEditor())
}

function handleZoomIn() {
  editorWindow.editor.setCameraZoomDelta(-5)
}

function handleZoomOut() {
  editorWindow.editor.setCameraZoomDelta(5)
}

function handleResetCamera() {
  editorWindow.editor.resetCameraZoom()
  editorWindow.editor.setCameraPosition({ x: 5, y: 0, z: 5 })
  editorWindow.editor.setCameraRotation(-Math.PI / 4)
}
