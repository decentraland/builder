import { takeLatest, select, put, call } from 'redux-saga/effects'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'

import {
  updateEditor,
  editorUndo,
  editorRedo,
  BIND_EDITOR_KEYBOARD_SHORTCUTS,
  UNBIND_KEYBOARD_SHORTCUTS,
  CLOSE_EDITOR,
  SET_GIZMO,
  SetGizmoAction,
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
  OPEN_EDITOR,
  setEditorReady,
  setGizmo,
  selectEntity,
  togglePreview,
  toggleSidebar,
  EDITOR_REDO,
  EDITOR_UNDO
} from 'modules/editor/actions'
import {
  PROVISION_SCENE,
  updateMetrics,
  updateTransform,
  resetItem,
  duplicateItem,
  deleteItem,
  DUPLICATE_ITEM
} from 'modules/scene/actions'
import { bindKeyboardShortcuts, unbindKeyboardShortcuts } from 'modules/keyboard/actions'
import { getCurrentScene, getEntityComponentByType } from 'modules/scene/selectors'
import { getAssetMappings } from 'modules/asset/selectors'
import { getCurrentProject } from 'modules/project/selectors'
import { KeyboardShortcut } from 'modules/keyboard/types'
import { SceneDefinition, SceneMetrics, ComponentType } from 'modules/scene/types'
import { Project } from 'modules/project/types'
import { EditorScene as EditorPayloadScene, Gizmo } from 'modules/editor/types'
import { store } from 'modules/common/store'
import { AssetMappings } from 'modules/asset/types'
import { RootState, Vector3, Quaternion } from 'modules/common/types'
import { EditorWindow } from 'components/Preview/Preview.types'
import { getNewScene } from './utils'
import { getGizmo, getSelectedEntityId, isPreviewing, isSidebarOpen } from './selectors'

const editorWindow = window as EditorWindow

export function* editorSaga() {
  yield takeLatest(BIND_EDITOR_KEYBOARD_SHORTCUTS, handleBindEditorKeyboardShortcuts)
  yield takeLatest(UNBIND_KEYBOARD_SHORTCUTS, handleUnbindEditorKeyboardShortcuts)
  yield takeLatest(OPEN_EDITOR, handleOpenEditor)
  yield takeLatest(CLOSE_EDITOR, handleCloseEditor)
  yield takeLatest(PROVISION_SCENE, handleRenderScene)
  yield takeLatest(EDITOR_REDO, handleRenderScene)
  yield takeLatest(EDITOR_UNDO, handleRenderScene)
  yield takeLatest(SET_GIZMO, handleSetGizmo)
  yield takeLatest(TOGGLE_PREVIEW, handleTooglePreview)
  yield takeLatest(TOGGLE_SIDEBAR, handleToggleSidebar)
  yield takeLatest(ZOOM_IN, handleZoomIn)
  yield takeLatest(ZOOM_OUT, handleZoomOut)
  yield takeLatest(RESET_CAMERA, handleResetCamera)
  yield takeLatest(DUPLICATE_ITEM, handleDuplicateItem)
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
      combination: ['w'],
      callback: () => store.dispatch(setGizmo(Gizmo.MOVE))
    },
    {
      combination: ['e'],
      callback: () => store.dispatch(setGizmo(Gizmo.ROTATE))
    },
    {
      combination: ['s'],
      callback: () => store.dispatch(resetItem())
    },
    {
      combination: ['d'],
      callback: () => store.dispatch(duplicateItem())
    },
    {
      combination: ['o'],
      callback: () => store.dispatch(togglePreview(!isPreviewing(store.getState() as RootState)))
    },
    {
      combination: ['p'],
      callback: () => store.dispatch(toggleSidebar(!isSidebarOpen(store.getState() as RootState)))
    },
    {
      combination: ['del', 'backspace'],
      callback: () => store.dispatch(deleteItem())
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
  const newScene: EditorPayloadScene = getNewScene(project)

  const msg = {
    type: 'update',
    payload: {
      scene: newScene
    }
  }

  // @ts-ignore: Client api
  yield call(() => editorWindow.editor.handleMessage(msg))
}

function* handleRenderScene() {
  const scene: SceneDefinition = yield select(getCurrentScene)
  if (scene) {
    const assetMappings: AssetMappings = yield select(getAssetMappings)
    yield call(() => editorWindow.editor.sendExternalAction(updateEditor(scene.id, scene, assetMappings)))
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
  if (!scene) return

  const transform = getEntityComponentByType(args.entityId, ComponentType.Transform)(store.getState() as RootState)
  if (!transform) return

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

function handleGizmoSelected(args: { gizmoType: Gizmo; entityId: string }) {
  const { gizmoType, entityId } = args
  const state = store.getState() as RootState
  const currentGizmo = getGizmo(state)
  if (currentGizmo !== gizmoType) {
    store.dispatch(setGizmo(gizmoType))
  }
  const selectedEntityId = getSelectedEntityId(state)
  if (selectedEntityId !== entityId) {
    store.dispatch(selectEntity(entityId))
  }
}

function handleEditorReadyChange() {
  store.dispatch(setEditorReady())
}

function* handleOpenEditor() {
  // Handles subscriptions to metrics
  yield call(() => editorWindow.editor.on('metrics', handleMetricsChange))

  // The client will report the deltas when the transform of an entity has changed (gizmo movement)
  yield call(() => editorWindow.editor.on('transform', handlePositionGizmoUpdate))

  // The client will report when the internal api is ready
  yield call(() => editorWindow.editor.on('ready', handleEditorReadyChange))

  // The client will report the deltas when the transform of an entity has changed (gizmo movement)
  yield call(() => editorWindow.editor.on('gizmoSelected', handleGizmoSelected))

  // Creates a new scene in the dcl client's side
  yield handleNewScene()

  // Spawns the assets
  yield handleRenderScene()
}

function* handleDuplicateItem() {
  yield call(() => editorWindow.editor.selectGizmo(Gizmo.NONE))
}

function* handleCloseEditor() {
  yield call(() => editorWindow.editor.off('metrics', handleMetricsChange))
}

function* handleSetGizmo(action: SetGizmoAction) {
  yield call(() => editorWindow.editor.selectGizmo(action.payload.gizmo))
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

function* handleToggleSidebar(_: ToggleSidebarAction) {
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
