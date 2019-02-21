import { delay } from 'redux-saga'
import { takeLatest, select, put, call } from 'redux-saga/effects'

import {
  updateEditor,
  BIND_EDITOR_KEYBOARD_SHORTCUTS,
  UNBIND_EDITOR_KEYBOARD_SHORTCUTS,
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
  OPEN_EDITOR,
  setEditorReady,
  setGizmo,
  selectEntity,
  EDITOR_REDO,
  EDITOR_UNDO,
  TAKE_SCREENSHOT,
  TakeScreenshotAction,
  takeScreenshot,
  unbindEditorKeyboardShortcuts,
  bindEditorKeyboardShortcuts,
  SET_EDITOR_READY,
  resetCamera,
  SELECT_ENTITY,
  SelectEntityAction,
  TOGGLE_SNAP_TO_GRID,
  ToggleSnapToGridAction
} from 'modules/editor/actions'
import { store } from 'modules/common/store'
import { PROVISION_SCENE, updateMetrics, updateTransform, DROP_ITEM, DropItemAction, addItem } from 'modules/scene/actions'
import { bindKeyboardShortcuts, unbindKeyboardShortcuts } from 'modules/keyboard/actions'
import { getCurrentScene, getEntityComponentByType } from 'modules/scene/selectors'
import { getAssetMappings } from 'modules/asset/selectors'
import { getCurrentProject, getProjectBounds } from 'modules/project/selectors'
import { Scene, SceneMetrics, ComponentType } from 'modules/scene/types'
import { Project } from 'modules/project/types'
import { EditorScene as EditorPayloadScene, Gizmo } from 'modules/editor/types'
import { AssetMappings } from 'modules/asset/types'
import { RootState, Vector3, Quaternion } from 'modules/common/types'
import { EditorWindow } from 'components/Preview/Preview.types'
import { getNewScene, resizeScreenshot, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT } from './utils'
import { getGizmo, getSelectedEntityId } from './selectors'
import { isWithinBounds } from 'modules/scene/utils'
import { PARCEL_SIZE } from 'modules/project/utils'
import { editProject } from 'modules/project/actions'
import { getEditorShortcuts } from 'modules/keyboard/utils'

const editorWindow = window as EditorWindow

export function* editorSaga() {
  yield takeLatest(BIND_EDITOR_KEYBOARD_SHORTCUTS, handleBindEditorKeyboardShortcuts)
  yield takeLatest(UNBIND_EDITOR_KEYBOARD_SHORTCUTS, handleUnbindEditorKeyboardShortcuts)
  yield takeLatest(OPEN_EDITOR, handleOpenEditor)
  yield takeLatest(CLOSE_EDITOR, handleCloseEditor)
  yield takeLatest(PROVISION_SCENE, handleSceneChange)
  yield takeLatest(EDITOR_REDO, handleSceneChange)
  yield takeLatest(EDITOR_UNDO, handleSceneChange)
  yield takeLatest(SET_GIZMO, handleSetGizmo)
  yield takeLatest(TOGGLE_PREVIEW, handleTooglePreview)
  yield takeLatest(TOGGLE_SIDEBAR, handleToggleSidebar)
  yield takeLatest(ZOOM_IN, handleZoomIn)
  yield takeLatest(ZOOM_OUT, handleZoomOut)
  yield takeLatest(RESET_CAMERA, handleResetCamera)
  yield takeLatest(DROP_ITEM, handleDropItem)
  yield takeLatest(TAKE_SCREENSHOT, handleScreenshot)
  yield takeLatest(SET_EDITOR_READY, handleResetCamera)
  yield takeLatest(SELECT_ENTITY, handleSelectEntity)
  yield takeLatest(TOGGLE_SNAP_TO_GRID, handleToggleSnapToGrid)
}

function* handleBindEditorKeyboardShortcuts() {
  const shortcuts = getEditorShortcuts(store)
  yield put(bindKeyboardShortcuts(shortcuts))
}

function* handleUnbindEditorKeyboardShortcuts() {
  const shortcuts = getEditorShortcuts(store)
  yield put(unbindKeyboardShortcuts(shortcuts))
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

function* handleSceneChange() {
  yield renderScene()
  yield delay(500)
  yield put(takeScreenshot())
}

function* renderScene() {
  const scene: Scene = yield select(getCurrentScene)
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
  yield renderScene()

  // Select gizmo
  const gizmo: ReturnType<typeof getGizmo> = yield select(getGizmo)
  yield call(() => editorWindow.editor.selectGizmo(gizmo))
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
  const { enabled } = action.payload
  const gizmo: ReturnType<typeof getGizmo> = yield select(getGizmo)

  yield call(() => {
    const { editor } = window as EditorWindow
    editor.setPlayMode(enabled)
    editor.sendExternalAction(action)
    editor.selectGizmo(enabled ? Gizmo.NONE : gizmo)
    resizeEditor()
  })
  if (enabled) {
    yield put(unbindEditorKeyboardShortcuts())
  } else {
    yield put(bindEditorKeyboardShortcuts())
    yield put(resetCamera())
  }
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

function* handleResetCamera() {
  const project: Project = yield select(getCurrentProject)
  const x = (project.parcelLayout.rows * PARCEL_SIZE) / 2
  const z = (project.parcelLayout.cols * PARCEL_SIZE) / 2

  editorWindow.editor.resetCameraZoom()
  editorWindow.editor.setCameraPosition({ x, y: 0, z })
  editorWindow.editor.setCameraRotation(-Math.PI / 4, Math.PI / 3)
}

function* handleDropItem(action: DropItemAction) {
  const { asset, x, y } = action.payload
  const position: Vector3 = yield call(() => editorWindow.editor.getMouseWorldPosition(x, y))
  const bounds = yield select(getProjectBounds)
  if (isWithinBounds(position, bounds)) {
    yield put(addItem(asset, position))
  }
}

function* handleScreenshot(_: TakeScreenshotAction) {
  try {
    const screenshot = yield call(() => editorWindow.editor.takeScreenshot())
    if (screenshot) {
      const thumbnail = yield call(() => resizeScreenshot(screenshot, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT))
      if (thumbnail) {
        const currentProject: Project | null = yield select(getCurrentProject)
        if (currentProject) {
          yield put(editProject(currentProject.id, { thumbnail }))
        }
      }
    }
  } catch (e) {
    // skip screenshot
  }
}

function* handleSelectEntity(action: SelectEntityAction) {
  yield call(() => {
    try {
      // this could throw if the entity does not exist, due to some race condition or the scene is not synced
      editorWindow.editor.selectEntity(action.payload.entityId)
    } catch (e) {
      // noop
    }
  })
}

function* handleToggleSnapToGrid(action: ToggleSnapToGridAction) {
  yield call(() => {
    if (action.payload.enabled) {
      editorWindow.editor.setGridResolution(0.5, 0.5, Math.PI / 4)
    } else {
      editorWindow.editor.setGridResolution(0, 0, 0)
    }
  })
}
