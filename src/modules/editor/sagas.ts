import { Color4, Wearable } from 'decentraland-ecs'
import { takeLatest, select, put, call, delay, take, race } from 'redux-saga/effects'
import { getSearch } from 'connected-react-router'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
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
  setSelectedEntities,
  EDITOR_REDO,
  EDITOR_UNDO,
  TAKE_SCREENSHOT,
  TakeScreenshotAction,
  takeScreenshot,
  unbindEditorKeyboardShortcuts,
  bindEditorKeyboardShortcuts,
  SET_EDITOR_READY,
  SET_SELECTED_ENTITIES,
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
  setScriptUrl,
  setScreenshotReady,
  OpenEditorAction,
  setEditorReadOnly,
  SetSelectedEntitiesAction,
  setItems,
  SET_ITEMS,
  updateAvatar,
  SET_BODY_SHAPE,
  SetBodyShapeAction,
  SET_AVATAR_ANIMATION,
  SetAvatarAnimationAction,
  setBodyShape,
  SET_SKIN_COLOR,
  SET_EYE_COLOR,
  SET_HAIR_COLOR,
  SET_BASE_WEARABLE,
  fetchBaseWearablesRequest,
  FETCH_BASE_WEARABLES_SUCCESS,
  FETCH_BASE_WEARABLES_FAILURE,
  FetchBaseWearablesSuccessAction,
  FetchBaseWearablesFailureAction,
  FETCH_BASE_WEARABLES_REQUEST,
  fetchBaseWearablesSuccess,
  fetchBaseWearablesFailure
} from 'modules/editor/actions'
import {
  PROVISION_SCENE,
  updateMetrics,
  updateTransform,
  DROP_ITEM,
  DropItemAction,
  addItem,
  setGround,
  ProvisionSceneAction,
  fixLegacyNamespacesRequest,
  syncSceneAssetsRequest,
  FIX_LEGACY_NAMESPACES_SUCCESS,
  FixLegacyNamespacesSuccessAction,
  SYNC_SCENE_ASSETS_SUCCESS,
  syncSceneAssetsSuccess
} from 'modules/scene/actions'
import { bindKeyboardShortcuts, unbindKeyboardShortcuts } from 'modules/keyboard/actions'
import { editProjectThumbnail } from 'modules/project/actions'
import { getCurrentScene, getEntityComponentsByType, getCurrentMetrics, getComponents } from 'modules/scene/selectors'
import { getCurrentProject, getCurrentBounds } from 'modules/project/selectors'
import { Scene, ComponentType, ComponentDefinition, ComponentData } from 'modules/scene/types'
import { ModelMetrics, Vector3, Quaternion } from 'modules/models/types'
import { Project } from 'modules/project/types'
import { AvatarAnimation, CatalystWearable, EditorScene, Gizmo, PreviewType } from 'modules/editor/types'
import { getLoading } from 'modules/assetPack/selectors'
import { GROUND_CATEGORY } from 'modules/asset/types'
import { RootState } from 'modules/common/types'
import { EditorWindow } from 'components/Preview/Preview.types'
import { store } from 'modules/common/store'
import { PARCEL_SIZE } from 'modules/project/constants'
import { snapToBounds, getSceneByProjectId } from 'modules/scene/utils'
import { getEditorShortcuts } from 'modules/keyboard/utils'
import { THUMBNAIL_PATH } from 'modules/assetPack/utils'
import { getCurrentPool } from 'modules/pool/selectors'
import { Pool } from 'modules/pool/types'
import { loadAssetPacksRequest, LOAD_ASSET_PACKS_SUCCESS, LOAD_ASSET_PACKS_REQUEST } from 'modules/assetPack/actions'
import { SAVE_ITEM_SUCCESS } from 'modules/item/actions'
import { Item, WearableBodyShape } from 'modules/item/types'
import { getItems } from 'modules/item/selectors'
import { AssetPackState } from 'modules/assetPack/reducer'
import { getBodyShapes, hasBodyShape } from 'modules/item/utils'
import { getContentsStorageUrl } from 'lib/api/builder'
import { PEER_URL } from 'lib/api/peer'
import { toLegacyURN } from 'lib/urnLegacy'
import {
  getGizmo,
  getSelectedEntityIds,
  getSceneMappings,
  isLoading,
  isReady,
  isPreviewing,
  isReadOnly,
  getEntitiesOutOfBoundaries,
  hasLoadedAssetPacks,
  isMultiselectEnabled,
  getBodyShape,
  getVisibleItems,
  getAvatarAnimation,
  getSkinColor,
  getEyeColor,
  getHairColor,
  getSelectedBaseWearables,
  getBaseWearables
} from './selectors'
import {
  getNewEditorScene,
  resizeScreenshot,
  snapScale,
  createReadyOnlyScene,
  areEqualTransforms,
  createAvatarProject,
  toWearable,
  mergeWearables,
  THUMBNAIL_WIDTH,
  THUMBNAIL_HEIGHT,
  POSITION_GRID_RESOLUTION,
  SCALE_GRID_RESOLUTION,
  ROTATION_GRID_RESOLUTION,
  fromCatalystWearableToWearable,
  patchWearables
} from './utils'
import { extraAvatarWearablesIds, getEyeColors, getHairColors, getSkinColors } from './avatar'

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
  yield takeLatest(SET_SELECTED_ENTITIES, handleSetSelectEntities)
  yield takeLatest(TOGGLE_SNAP_TO_GRID, handleToggleSnapToGrid)
  yield takeLatest(PREFETCH_ASSET, handlePrefetchAsset)
  yield takeLatest(CREATE_EDITOR_SCENE, handleCreateEditorScene)
  yield takeLatest(SET_AVATAR_ANIMATION, handleSetAvatarAnimation)
  yield takeLatest(SET_BODY_SHAPE, handleSetBodyShape)
  yield takeLatest(SET_ITEMS, renderAvatar)
  yield takeLatest(SAVE_ITEM_SUCCESS, renderAvatar)
  yield takeLatest(SET_SKIN_COLOR, renderAvatar)
  yield takeLatest(SET_EYE_COLOR, renderAvatar)
  yield takeLatest(SET_HAIR_COLOR, renderAvatar)
  yield takeLatest(SET_BASE_WEARABLE, renderAvatar)
  yield takeLatest(FETCH_BASE_WEARABLES_REQUEST, handleFetchBaseWearables)
}

function* pollEditor(scene: Scene) {
  let metrics: ModelMetrics
  let entities: number

  do {
    entities = Object.values(scene.entities).length
    metrics = yield select(getCurrentMetrics)
    yield delay(300)
  } while (entities > 0 && metrics.entities === 0)

  while (editorWindow.editor.getLoadingEntities() !== null) {
    yield delay(500)
  }
}

function* handleEditorReady(scene: Scene) {
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
  yield call([editorWindow.editor, 'handleMessage'], msg)
  yield handleResetCamera()
}

function* handleProvisionScene(action: ProvisionSceneAction) {
  const { scene, init } = action.payload
  yield renderScene(scene)
  if (!init) {
    yield put(takeScreenshot())
  }
}

function* handleHistory() {
  const scene: Scene = yield select(getCurrentScene)
  yield renderScene(scene)
  yield put(takeScreenshot())
}

function* renderScene(scene: Scene) {
  if (scene) {
    const mappings: ReturnType<typeof getSceneMappings> = yield select(getSceneMappings)
    const isReadOnlyResult: boolean = yield select(isReadOnly)
    if (isReadOnlyResult) {
      scene = createReadyOnlyScene(scene)
    }
    yield call(() => editorWindow.editor.sendExternalAction(updateEditor(scene.id, { ...scene }, mappings)))
  }
}

function handleMetricsChange(args: { metrics: ModelMetrics; limits: ModelMetrics }) {
  const { metrics, limits } = args
  const scene = getCurrentScene(store.getState() as RootState)
  if (scene) {
    store.dispatch(updateMetrics(scene.id, metrics, limits))
  }
}

function handleTransformChange(args: { transforms: { entityId: string; position: Vector3; rotation: Quaternion; scale: Vector3 }[] }) {
  const bounds: ReturnType<typeof getCurrentBounds> = getCurrentBounds(store.getState() as RootState)
  const project: ReturnType<typeof getCurrentProject> = getCurrentProject(store.getState() as RootState)

  if (!project) return

  const scene: ReturnType<typeof getCurrentScene> = getCurrentScene(store.getState() as RootState)
  if (!scene) return

  const entityComponents = getEntityComponentsByType(store.getState() as RootState)
  const transformData: { componentId: string; data: ComponentData[ComponentType.Transform] }[] = []

  for (let transformPayload of args.transforms) {
    let position: Vector3 = { x: 0, y: 0, z: 0 }
    const transform = entityComponents[transformPayload.entityId][ComponentType.Transform] as
      | ComponentDefinition<ComponentType.Transform>
      | undefined

    if (!transform) continue

    if (bounds) {
      position = snapToBounds(transformPayload.position, bounds)
    }

    const scale = snapScale(transformPayload.scale)

    if (transform) {
      const newTransformData = { position, rotation: transformPayload.rotation, scale }
      if (areEqualTransforms(transform.data, newTransformData)) continue
      transformData.push({ componentId: transform.id, data: newTransformData })
    } else {
      console.warn(`Unable to find Transform component for ${transformPayload.entityId}`)
    }
  }
  if (transformData.length > 0) {
    store.dispatch(updateTransform(scene.id, transformData))
  }
}

function handleGizmoSelected(args: { gizmoType: Gizmo; entities: string[] }) {
  const { gizmoType, entities } = args
  const state = store.getState() as RootState
  const currentGizmo = getGizmo(state)
  const multiselectionEnabled = isMultiselectEnabled(state)

  if (currentGizmo !== gizmoType) {
    store.dispatch(setGizmo(gizmoType))
  }
  const selectedEntityId = getSelectedEntityIds(state)
  let newSelectedEntities = selectedEntityId

  if (entities.length === 0) {
    if (!multiselectionEnabled && selectedEntityId.length > 0) {
      newSelectedEntities = []
    }
  } else {
    if (!multiselectionEnabled) {
      newSelectedEntities = entities
    } else {
      for (let entityId of entities) {
        if (!newSelectedEntities.includes(entityId)) {
          newSelectedEntities.push(entityId)
        } else {
          newSelectedEntities = newSelectedEntities.filter(id => id !== entityId)
        }
      }
    }
  }
  store.dispatch(setSelectedEntities(newSelectedEntities))
}

function handleEditorReadyChange() {
  store.dispatch(setEditorReady(true))
}

function* handleOpenEditor(action: OpenEditorAction) {
  const { isReadOnly, type } = action.payload
  // Handles subscriptions to metrics
  yield call([editorWindow.editor, 'on'], 'metrics', handleMetricsChange)

  // The client will report the deltas when the transform of an entity has changed (gizmo movement)
  yield call([editorWindow.editor, 'on'], 'transform', handleTransformChange)

  // The client will report when the internal api is ready
  yield call([editorWindow.editor, 'on'], 'ready', handleEditorReadyChange)

  // The client will report the deltas when the transform of an entity has changed (gizmo movement)
  yield call([editorWindow.editor, 'on'], 'gizmoSelected', handleGizmoSelected)

  // The client will report when an entity goes out of bounds
  yield call([editorWindow.editor, 'on'], 'entitiesOutOfBoundaries', handleEntitiesOutOfBoundaries)

  if (type === PreviewType.WEARABLE) {
    const search: ReturnType<typeof getSearch> = yield select(getSearch)
    const itemId = new URLSearchParams(search).get('item')
    const items: Item[] = yield select(getItems)
    const item = items.find(item => item.id === itemId)

    yield put(setEditorReadOnly(true))
    yield call(createNewEditorScene, createAvatarProject())

    // set camera
    yield call([editorWindow.editor, 'setBuilderConfiguration'], {
      camera: { zoomMax: 5, zoomMin: 2, zoomDefault: 2 },
      environment: { disableFloor: true }
    })
    yield call([editorWindow.editor, 'resetCameraZoom'])
    yield call([editorWindow.editor, 'setCameraPosition'], { x: 8, y: 1, z: 8 })
    yield call([editorWindow.editor, 'setCameraRotation'], Math.PI, Math.PI / 16)

    const baseWearables: ReturnType<typeof getBaseWearables> = yield select(getBaseWearables)
    // Only fetch the base wearables if there's none set
    if (baseWearables.length === 0) {
      yield put(fetchBaseWearablesRequest())
      const { failure }: { success: FetchBaseWearablesSuccessAction; failure: FetchBaseWearablesFailureAction } = yield race({
        success: take(FETCH_BASE_WEARABLES_SUCCESS),
        failure: take(FETCH_BASE_WEARABLES_FAILURE)
      })

      if (failure) {
        console.error('Failed to load the base wearables', failure)
        throw new Error(failure.payload.error)
      }
    }

    if (item) {
      // select a valid body shape for the selected item
      const currentBodyShape: ReturnType<typeof getBodyShape> = yield select(getBodyShape)
      if (!hasBodyShape(item, currentBodyShape)) {
        const bodyShapes = getBodyShapes(item)
        if (bodyShapes.length > 0) {
          yield put(setBodyShape(bodyShapes[0]))
        }
      }

      // render avatar with selected item
      yield put(setItems([item]))
    } else {
      // render avatar without any selected items
      yield put(setItems([]))
    }
  } else {
    // Creates a new scene in the dcl client's side
    const project: Project | Pool | null = yield type === PreviewType.POOL ? select(getCurrentPool) : select(getCurrentProject)

    // set editor in "scene mode" (min/max zoom, and show floor)
    yield call(() => {
      editorWindow.editor.setBuilderConfiguration({
        camera: { zoomMax: 100, zoomMin: 1, zoomDefault: 32 },
        environment: { disableFloor: false }
      })
    })

    if (project) {
      // load asset packs
      const areLoaded: boolean = yield select(hasLoadedAssetPacks)
      if (!areLoaded) {
        yield put(loadAssetPacksRequest())
      }

      // fix legacy stuff
      let scene: Scene = yield getSceneByProjectId(project.id, type)
      yield put(fixLegacyNamespacesRequest(scene))
      const fixSuccessAction: FixLegacyNamespacesSuccessAction = yield take(FIX_LEGACY_NAMESPACES_SUCCESS)
      scene = fixSuccessAction.payload.scene

      // if assets packs are being loaded wait for them to finish
      const loading: AssetPackState['loading'] = yield select(getLoading)
      if (isLoadingType(loading, LOAD_ASSET_PACKS_REQUEST)) {
        yield take(LOAD_ASSET_PACKS_SUCCESS)
      }

      // sync scene assets
      yield put(syncSceneAssetsRequest(scene))
      const syncSuccessAction: ReturnType<typeof syncSceneAssetsSuccess> = yield take(SYNC_SCENE_ASSETS_SUCCESS)
      scene = syncSuccessAction.payload.scene

      yield put(setEditorReadOnly(isReadOnly))
      yield createNewEditorScene(project)

      // Set the remote url for scripts
      yield call(() => editorWindow.editor.sendExternalAction(setScriptUrl(getContentsStorageUrl())))

      // Spawns the assets
      yield renderScene(scene)

      // Enable snap to grid
      yield handleToggleSnapToGrid(toggleSnapToGrid(true))

      // Select gizmo
      yield call(() => editorWindow.editor.selectGizmo(Gizmo.NONE))
    } else {
      console.error(`Unable to Open Editor: Invalid ${type}`)
    }
  }
}

function* handleCloseEditor() {
  yield call(() => editorWindow.editor.off('metrics', handleMetricsChange))
  yield call(() => editorWindow.editor.off('transform', handleTransformChange))
  yield call(() => editorWindow.editor.off('ready', handleEditorReadyChange))
  yield call(() => editorWindow.editor.off('gizmoSelected', handleGizmoSelected))
  yield call(() => editorWindow.editor.off('entitiesOutOfBoundaries', handleEntitiesOutOfBoundaries))
  const isReadyResult: boolean = yield select(isReady)
  if (isReadyResult) {
    yield call(() => editorWindow.editor.sendExternalAction(closeEditor()))
  }
  yield put(unbindEditorKeyboardShortcuts())
}

function* handleSetGizmo(action: SetGizmoAction) {
  const isReadyResult: boolean = yield select(isReady)
  if (isReadyResult) {
    yield call(() => editorWindow.editor.selectGizmo(action.payload.gizmo))
  }
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
    const components: Scene['components'] = yield select(getComponents)
    const hasScript = Object.values(components).some(component => component.type === ComponentType.Script)

    if (hasScript) {
      // Reset scene
      yield createNewEditorScene(project)
      yield call(() => editorWindow.editor.sendExternalAction(setScriptUrl(getContentsStorageUrl())))
    }

    yield handleResetCamera()
    const scene: Scene = yield select(getCurrentScene)
    yield renderScene(scene)
  } else {
    editor.setCameraPosition({ x, y: 1.5, z })
    editor.setCameraRotation(0, 0)
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
        let scene: Scene = yield getSceneByProjectId(project.id)
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
  editorWindow.editor.setCameraRotation((7 * Math.PI) / 4, Math.PI / 6)
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
  yield put(setScreenshotReady(false))
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

    const screenshot: string = yield call(() => editorWindow.editor.takeScreenshot())
    if (!screenshot) return

    const thumbnail: string | null = yield call(() => resizeScreenshot(screenshot, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT))
    if (!thumbnail) return

    yield put(editProjectThumbnail(currentProject.id, thumbnail))
  } catch (e) {
    // skip screenshot
  }
  yield put(setScreenshotReady(true))
}

function* handleSetSelectEntities(action: SetSelectedEntitiesAction) {
  yield call(() => {
    try {
      // this could throw if the entity does not exist, due to some race condition or the scene is not synced
      editorWindow.editor.setSelectedEntities(action.payload.entityIds)
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
        editorWindow.editor.preloadFile(`${hash}\t${action.payload.asset.id}/${file}`)
      }
    }
  })
}

function handleEntitiesOutOfBoundaries(args: { entities: string[] }) {
  const { entities } = args
  const state = store.getState() as RootState
  const entitiesInState: string[] = getEntitiesOutOfBoundaries(state)
  if (entities.length === 0 && entitiesInState.length === 0) {
    return
  }
  const previewMode: boolean = isPreviewing(state)
  if (!previewMode) {
    store.dispatch(setEntitiesOutOfBoundaries(entities))
  }
}

function* getDefaultWearables() {
  const bodyShape: WearableBodyShape = yield select(getBodyShape)
  const baseWearables: Wearable[] = yield select(getBaseWearables)

  const selectedBaseWearables: ReturnType<typeof getSelectedBaseWearables> = yield select(getSelectedBaseWearables)
  if (!selectedBaseWearables) {
    throw new Error('No base wearables selected')
  }

  let wearables = Object.values(selectedBaseWearables[bodyShape]).filter(wearable => wearable !== null) as Wearable[]
  const extras = baseWearables
    .filter(wearable => extraAvatarWearablesIds[bodyShape].includes(wearable.id))
    .filter(extraWearable => !wearables.some(wearable => wearable.category === extraWearable.category))
  wearables = wearables.concat(extras)

  // @TODO: remove this when unity build accepts urn
  return wearables.map(w => ({
    ...w,
    id: toLegacyURN(w.id),
    representations: w.representations.map(r => ({
      ...r,
      bodyShapes: r.bodyShapes.map(toLegacyURN)
    }))
  }))
}

function* renderAvatar() {
  const isEditorReady: boolean = yield select(isReady)
  if (isEditorReady) {
    const visibleItems: Item[] = yield select(getVisibleItems)
    const defaultWearables: Wearable[] = yield getDefaultWearables()
    const wearables = mergeWearables(defaultWearables, visibleItems.map(toWearable))
    const animation: AvatarAnimation = yield select(getAvatarAnimation)
    const skinColor: Color4 = yield select(getSkinColor)
    const eyeColor: Color4 = yield select(getEyeColor)
    const hairColor: Color4 = yield select(getHairColor)

    const patchedWearables = patchWearables(wearables)

    yield call(async () => {
      editorWindow.editor.addWearablesToCatalog(patchedWearables)
      editorWindow.editor.sendExternalAction(updateAvatar(patchedWearables, skinColor, eyeColor, hairColor, animation))
    })
  }
}

function* bustCache() {
  const defaultWearables: Wearable[] = yield getDefaultWearables()
  const skinColor: Color4 = getSkinColors()[0]
  const eyeColor: Color4 = getEyeColors()[0]
  const hairColor: Color4 = getHairColors()[0]
  editorWindow.editor.addWearablesToCatalog(defaultWearables)
  editorWindow.editor.sendExternalAction(updateAvatar(defaultWearables, skinColor, eyeColor, hairColor, AvatarAnimation.IDLE))
  yield delay(32)
}

function* handleSetBodyShape(_action: SetBodyShapeAction) {
  yield bustCache() // without this, the representation of the wearables get cached when the body shape changes

  // this gets rid of items that don't have a representation for the current body shape
  const visibleItems: Item[] = yield select(getVisibleItems)
  yield put(setItems(visibleItems))
}

function* handleSetAvatarAnimation(_action: SetAvatarAnimationAction) {
  yield renderAvatar()
}

function* handleFetchBaseWearables() {
  try {
    const response: Response = yield call(
      fetch,
      `${PEER_URL}/lambdas/collections/wearables?collectionId=urn:decentraland:off-chain:base-avatars`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch base wearables')
    }
    const json: { wearables: CatalystWearable[] } = yield response.json()
    // Filter wearables that hide or replace others, preventing issues with the previewed
    const wearables: Wearable[] = json.wearables
      .filter(wearable => {
        const hidesWearables = wearable.data.hides && wearable.data.hides.length > 0
        const replacesWearables = wearable.data.replaces && wearable.data.replaces.length > 0
        return !hidesWearables && !replacesWearables
      })
      .map(fromCatalystWearableToWearable)
    yield put(fetchBaseWearablesSuccess(wearables))
  } catch (e) {
    yield put(fetchBaseWearablesFailure(e.message))
  }
}
