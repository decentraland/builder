// @ts-ignore
import { takeLatest, select, put, call, delay, take, race } from 'redux-saga/effects'

import {
  updateEditor,
  BIND_EDITOR_KEYBOARD_SHORTCUTS,
  UNBIND_EDITOR_KEYBOARD_SHORTCUTS,
  CLOSE_EDITOR,
  SET_GIZMO,
  SetGizmoAction,
  TogglePreviewAction,
  TOGGLE_PREVIEW,
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
  SELECT_ENTITY,
  SelectEntityAction,
  TOGGLE_SNAP_TO_GRID,
  ToggleSnapToGridAction,
  toggleSnapToGrid,
  PREFETCH_ASSET,
  PrefetchAssetAction,
  SetEditorReadyAction,
  setEntitiesOutOfBoundaries,
  closeEditor,
  setEditorLoading,
  CREATE_EDITOR_SCENE,
  CreateEditorSceneAction,
  SET_EDITOR_LOADING,
  SetEditorLoadingAction,
  setScriptUrl
} from 'modules/editor/actions'
import {
  PROVISION_SCENE,
  updateMetrics,
  updateTransform,
  DROP_ITEM,
  DropItemAction,
  addItem,
  setGround,
  ProvisionSceneAction
} from 'modules/scene/actions'
import { bindKeyboardShortcuts, unbindKeyboardShortcuts } from 'modules/keyboard/actions'
import { editProjectThumbnail } from 'modules/project/actions'
import { getCurrentScene, getEntityComponentByType, getCurrentMetrics } from 'modules/scene/selectors'
import { getCurrentProject, getCurrentBounds } from 'modules/project/selectors'
import { Scene, ComponentType, SceneMetrics } from 'modules/scene/types'
import { Project } from 'modules/project/types'
import { EditorScene, Gizmo } from 'modules/editor/types'
import { GROUND_CATEGORY } from 'modules/asset/types'
import { RootState, Vector3, Quaternion } from 'modules/common/types'
import { EditorWindow } from 'components/Preview/Preview.types'
import { store } from 'modules/common/store'
import { PARCEL_SIZE } from 'modules/project/utils'
import { snapToBounds, getSceneByProjectId } from 'modules/scene/utils'
import { getEditorShortcuts } from 'modules/keyboard/utils'
import { THUMBNAIL_PATH } from 'modules/assetPack/utils'
import { BUILDER_SERVER_URL } from 'lib/api/builder'
import { getGizmo, getSelectedEntityId, getSceneMappings, isLoading, isReady, isPreviewing } from './selectors'

import {
  getNewEditorScene,
  resizeScreenshot,
  THUMBNAIL_WIDTH,
  THUMBNAIL_HEIGHT,
  snapScale,
  POSITION_GRID_RESOLUTION,
  SCALE_GRID_RESOLUTION,
  ROTATION_GRID_RESOLUTION
} from './utils'

const editorWindow = window as EditorWindow

export function* editorSaga() {
  yield takeLatest(BIND_EDITOR_KEYBOARD_SHORTCUTS, handleBindEditorKeyboardShortcuts)
  yield takeLatest(UNBIND_EDITOR_KEYBOARD_SHORTCUTS, handleUnbindEditorKeyboardShortcuts)
  yield takeLatest(OPEN_EDITOR, handleOpenEditor)
  yield takeLatest(CLOSE_EDITOR, handleCloseEditor)
  yield takeLatest(PROVISION_SCENE, handleProvisionScene)
  yield takeLatest(EDITOR_REDO, handleHistory)
  yield takeLatest(EDITOR_UNDO, handleHistory)
  yield takeLatest(SET_GIZMO, handleSetGizmo)
  yield takeLatest(TOGGLE_PREVIEW, handleTogglePreview)
  yield takeLatest(ZOOM_IN, handleZoomIn)
  yield takeLatest(ZOOM_OUT, handleZoomOut)
  yield takeLatest(RESET_CAMERA, handleResetCamera)
  yield takeLatest(DROP_ITEM, handleDropItem)
  yield takeLatest(TAKE_SCREENSHOT, handleScreenshot)
  yield takeLatest(SET_EDITOR_READY, handleSetEditorReady)
  yield takeLatest(SELECT_ENTITY, handleSelectEntity)
  yield takeLatest(TOGGLE_SNAP_TO_GRID, handleToggleSnapToGrid)
  yield takeLatest(PREFETCH_ASSET, handlePrefetchAsset)
  yield takeLatest(CREATE_EDITOR_SCENE, handleCreateEditorScene)
}

function* pollEditor(scene: Scene) {
  let metrics
  let entities

  do {
    entities = Object.values(scene.entities).length
    metrics = yield select(getCurrentMetrics)
    yield delay(300)
  } while (entities > 0 && metrics.entities === 0)

  while (editorWindow.editor.getLoadingEntity() !== null) {
    yield delay(500)
  }
}

function* handleEditorReady(scene: Scene) {
  yield handleResetCamera()
  yield pollEditor(scene)
  yield put(setEditorLoading(false))
}

function* handleBindEditorKeyboardShortcuts() {
  const shortcuts = getEditorShortcuts(store)
  yield put(bindKeyboardShortcuts(shortcuts))
}

function* handleUnbindEditorKeyboardShortcuts() {
  const shortcuts = getEditorShortcuts(store)
  yield put(unbindKeyboardShortcuts(shortcuts))
}

function* handleCreateEditorScene(action: CreateEditorSceneAction) {
  yield createNewEditorScene(action.payload.project)
}

function* createNewEditorScene(project: Project) {
  const newScene: EditorScene = getNewEditorScene(project)

  const msg = {
    type: 'update',
    payload: {
      scene: newScene
    }
  }

  // @ts-ignore: Client api
  yield call(() => editorWindow.editor.handleMessage(msg))
  yield handleResetCamera()
}

function* handleProvisionScene(action: ProvisionSceneAction) {
  yield renderScene()
  if (!action.payload.init) {
    yield put(takeScreenshot())
  }
}

function* handleHistory() {
  yield renderScene()
  yield put(takeScreenshot())
}

function* renderScene() {
  const scene: Scene = yield select(getCurrentScene)
  if (scene) {
    const mappings: ReturnType<typeof getSceneMappings> = yield select(getSceneMappings)
    yield call(() => editorWindow.editor.sendExternalAction(updateEditor(scene.id, scene, mappings)))
  }
}

function handleMetricsChange(args: { metrics: SceneMetrics; limits: SceneMetrics }) {
  const { metrics, limits } = args
  const scene = getCurrentScene(store.getState() as RootState)
  if (scene) {
    store.dispatch(updateMetrics(scene.id, metrics, limits))
  }
}

function handleTransformChange(args: { entityId: string; transform: { position: Vector3; rotation: Quaternion; scale: Vector3 } }) {
  const bounds: ReturnType<typeof getCurrentBounds> = getCurrentBounds(store.getState() as RootState)
  const project: ReturnType<typeof getCurrentProject> = getCurrentProject(store.getState() as RootState)
  let position: Vector3 = { x: 0, y: 0, z: 0 }

  if (!project) return

  const scene: ReturnType<typeof getCurrentScene> = getCurrentScene(store.getState() as RootState)
  if (!scene) return

  const entityComponents = getEntityComponentByType(store.getState() as RootState)
  const transform = entityComponents[args.entityId][ComponentType.Transform]
  if (!transform) return

  if (bounds) {
    position = snapToBounds(args.transform.position, bounds)
  }

  const scale = snapScale(args.transform.scale)

  if (transform) {
    store.dispatch(updateTransform(scene.id, transform.id, { position, rotation: args.transform.rotation, scale }))
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
  store.dispatch(setEditorReady(true))
}

function* handleOpenEditor() {
  // Handles subscriptions to metrics
  yield call(() => editorWindow.editor.on('metrics', handleMetricsChange))

  // The client will report the deltas when the transform of an entity has changed (gizmo movement)
  yield call(() => editorWindow.editor.on('transform', handleTransformChange))

  // The client will report when the internal api is ready
  yield call(() => editorWindow.editor.on('ready', handleEditorReadyChange))

  // The client will report the deltas when the transform of an entity has changed (gizmo movement)
  yield call(() => editorWindow.editor.on('gizmoSelected', handleGizmoSelected))

  // The client will report when an entity goes out of bounds
  yield call(() => editorWindow.editor.on('entitiesOutOfBoundaries', handleEntitiesOutOfBoundaries))

  // Creates a new scene in the dcl client's side
  const project: Project | null = yield select(getCurrentProject)

  if (project) {
    yield createNewEditorScene(project)

    // Set the remote url for scripts
    yield call(() => editorWindow.editor.sendExternalAction(setScriptUrl(`${BUILDER_SERVER_URL}/storage/assets`)))

    // Spawns the assets
    yield renderScene()

    // Enable snap to grid
    yield handleToggleSnapToGrid(toggleSnapToGrid(true))

    // Select gizmo
    yield call(() => editorWindow.editor.selectGizmo(Gizmo.NONE))
  } else {
    console.error('Unable to Open Editor: Invalid project')
  }
}

function* handleCloseEditor() {
  yield call(() => editorWindow.editor.off('metrics', handleMetricsChange))
  yield call(() => editorWindow.editor.off('transform', handleTransformChange))
  yield call(() => editorWindow.editor.off('ready', handleEditorReadyChange))
  yield call(() => editorWindow.editor.off('gizmoSelected', handleGizmoSelected))
  yield call(() => editorWindow.editor.off('entitiesOutOfBoundaries', handleEntitiesOutOfBoundaries))
  yield call(() => editorWindow.editor.sendExternalAction(closeEditor()))
  yield put(unbindEditorKeyboardShortcuts())
}

function* handleSetGizmo(action: SetGizmoAction) {
  yield call(() => editorWindow.editor.selectGizmo(action.payload.gizmo))
}

function* handleTogglePreview(action: TogglePreviewAction) {
  const { editor } = editorWindow
  const { isEnabled } = action.payload
  const gizmo: ReturnType<typeof getGizmo> = yield select(getGizmo)
  const project: Project | null = yield select(getCurrentProject)
  if (!project) return

  const x = (project.layout.rows * PARCEL_SIZE) / 2
  const z = -1

  yield call(() => {
    editor.setPlayMode(isEnabled)
    editor.sendExternalAction(action)
    editor.selectGizmo(isEnabled ? Gizmo.NONE : gizmo)
  })

  if (!isEnabled) {
    yield createNewEditorScene(project)
    yield call(() => editorWindow.editor.sendExternalAction(setScriptUrl(`${BUILDER_SERVER_URL}/storage/assets`)))
    yield handleResetCamera()
    yield renderScene()
  } else {
    editor.setCameraPosition({ x, y: 1.5, z })
  }

  yield changeEditorState(!isEnabled)
}

function handleZoomIn() {
  editorWindow.editor.setCameraZoomDelta(-5)
}

function handleZoomOut() {
  editorWindow.editor.setCameraZoomDelta(5)
}

function* handleSetEditorReady(action: SetEditorReadyAction) {
  const { isReady } = action.payload
  const project: Project | null = yield select(getCurrentProject)
  if (project) {
    if (isReady) {
      try {
        let scene = yield getSceneByProjectId(project.id)
        yield handleEditorReady(scene)
      } catch (error) {
        console.error(error)
      }
    }

    yield changeEditorState(isReady)
  }
}

function* changeEditorState(isReady: boolean) {
  if (isReady) {
    yield put(bindEditorKeyboardShortcuts())
    yield handleResetCamera()
  } else {
    yield put(unbindEditorKeyboardShortcuts())
  }
}

function* handleResetCamera() {
  const project: Project | null = yield select(getCurrentProject)
  if (!project) return

  const x = (project.layout.rows * PARCEL_SIZE) / 2
  const z = (project.layout.cols * PARCEL_SIZE) / 2

  editorWindow.editor.resetCameraZoom()
  editorWindow.editor.setCameraPosition({ x, y: 0, z })
  editorWindow.editor.setCameraRotation(-Math.PI / 4, Math.PI / 6)
}

function* handleDropItem(action: DropItemAction) {
  const { asset, x, y } = action.payload
  if (asset.category === GROUND_CATEGORY) {
    const project: ReturnType<typeof getCurrentProject> = yield select(getCurrentProject)
    if (!project) return
    yield put(setGround(project.id, asset))
  } else {
    const position: Vector3 = yield call(() => editorWindow.editor.getMouseWorldPosition(x, y))
    yield put(addItem(asset, position))
  }
}

function* handleScreenshot(_: TakeScreenshotAction) {
  try {
    const currentProject: Project | null = yield select(getCurrentProject)
    if (!currentProject) return

    // wait for editor to be ready
    let ready: boolean = yield select(isReady)
    while (!ready) {
      const readyAction: SetEditorReadyAction = yield take(SET_EDITOR_READY)
      ready = readyAction.payload.isReady
    }

    // wait for assets to load
    let loading: boolean = yield select(isLoading)
    while (loading) {
      const loadingAction: SetEditorLoadingAction = yield take(SET_EDITOR_LOADING)
      loading = loadingAction.payload.isLoading
    }

    // rendering leeway
    yield delay(2000)

    const screenshot = yield call(() => editorWindow.editor.takeScreenshot())
    if (!screenshot) return

    const thumbnail = yield call(() => resizeScreenshot(screenshot, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT))
    if (!thumbnail) return

    yield put(editProjectThumbnail(currentProject.id, thumbnail))
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
      editorWindow.editor.setGridResolution(POSITION_GRID_RESOLUTION, ROTATION_GRID_RESOLUTION, SCALE_GRID_RESOLUTION)
    } else {
      editorWindow.editor.setGridResolution(0, 0, 0)
    }
  })
}

function* handlePrefetchAsset(action: PrefetchAssetAction) {
  yield call(() => {
    const contentEntries = Object.entries(action.payload.asset.contents)
    for (let [file, hash] of contentEntries) {
      if ((file.endsWith('.png') || file.endsWith('.glb') || file.endsWith('.gltf')) && !file.endsWith(THUMBNAIL_PATH)) {
        editorWindow.editor.preloadFile(`${hash}\t${action.payload.asset.assetPackId}/${file}`)
      }
    }
  })
}

function* handleEntitiesOutOfBoundaries(args: { entities: string[] }) {
  const { entities } = args
  const previewMode: boolean = yield select(isPreviewing)
  if (!previewMode) {
    store.dispatch(setEntitiesOutOfBoundaries(entities))
  }
}
