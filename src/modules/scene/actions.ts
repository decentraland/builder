import { action } from 'typesafe-actions'
import { Vector3 } from 'modules/common/types'
import { Asset, AssetParameterValues } from 'modules/asset/types'
import { Scene, SceneMetrics, ComponentType, ComponentData } from './types'
import { Project } from 'modules/project/types'

// Create a scene (doesn't trigger ECS re-render)

export const CREATE_SCENE = 'Create scene'

export const createScene = (scene: Scene) => action(CREATE_SCENE, { scene })

export type CreateSceneAction = ReturnType<typeof createScene>

// Provision a scene

export const PROVISION_SCENE = 'Provision scene'

export const provisionScene = (scene: Scene, init = false) => action(PROVISION_SCENE, { scene, init })

export type ProvisionSceneAction = ReturnType<typeof provisionScene>

// Update metrics

export const UPDATE_METRICS = 'Update metrics'

export const updateMetrics = (sceneId: string, metrics: SceneMetrics, limits: SceneMetrics) =>
  action(UPDATE_METRICS, { sceneId, metrics, limits })

export type UpdateMetricsAction = ReturnType<typeof updateMetrics>

// Update component

export const UPDATE_TRANSFORM = 'Update transform'

export const updateTransform = (sceneId: string, componentId: string, data: ComponentData[ComponentType.Transform]) =>
  action(UPDATE_TRANSFORM, { sceneId, componentId, data })

export type UpdateTransfromAction = ReturnType<typeof updateTransform>

// Spawn item

export const ADD_ITEM = 'Add item'

export const addItem = (asset: Asset, position?: Vector3) => action(ADD_ITEM, { asset, position })

export type AddItemAction = ReturnType<typeof addItem>

// Spawn item on the mouse position (used for drag and drop)

export const DROP_ITEM = 'Drop item'

export const dropItem = (asset: Asset, x: number, y: number) => action(DROP_ITEM, { asset, x, y })

export type DropItemAction = ReturnType<typeof dropItem>

// Reset item

export const RESET_ITEM = 'Reset item'

export const resetItem = () => action(RESET_ITEM, {})

export type ResetItemAction = ReturnType<typeof resetItem>

// Duplicate item

export const DUPLICATE_ITEM = 'Duplicate item'

export const duplicateItem = () => action(DUPLICATE_ITEM, {})

export type DuplicateItemAction = ReturnType<typeof duplicateItem>

// Delete item

export const DELETE_ITEM = 'Delete item'

export const deleteItem = () => action(DELETE_ITEM, {})

export type DeleteItemAction = ReturnType<typeof deleteItem>

// Set ground

export const SET_GROUND = 'Set ground'

export const setGround = (projectId: string, asset?: Asset) => action(SET_GROUND, { projectId, asset })

export type SetGroundAction = ReturnType<typeof setGround>

// Set Layout

export const APPLY_LAYOUT = 'Apply Layout'

export const applyLayout = (project: Project) => action(APPLY_LAYOUT, { project })

export type ApplyLayoutAction = ReturnType<typeof applyLayout>

// Fix Lagacy Namespaces Request

export const FIX_LEGACY_NAMESPACES_REQUEST = '[Request] Fix Legacy Namespaces'

export const fixLegacyNamespacesRequest = (scene: Scene) => action(FIX_LEGACY_NAMESPACES_REQUEST, { scene })

export type FixLegacyNamespacesRequestAction = ReturnType<typeof fixLegacyNamespacesRequest>

// Fix Lagacy Namespaces Success

export const FIX_LEGACY_NAMESPACES_SUCCESS = '[Success] Fix Legacy Namespaces'

export const fixLegacyNamespacesSuccess = (scene: Scene) => action(FIX_LEGACY_NAMESPACES_SUCCESS, { scene })

export type FixLegacyNamespacesSuccessAction = ReturnType<typeof fixLegacyNamespacesSuccess>

// Sync Scene Assets

export const SYNC_SCENE_ASSETS_REQUEST = '[Request] Sync Scene Assets'

export const syncSceneAssetsRequest = (scene: Scene) => action(SYNC_SCENE_ASSETS_REQUEST, { scene })

export type SyncSceneAssetsRequestAction = ReturnType<typeof syncSceneAssetsRequest>

// Sync Scene Assets

export const SYNC_SCENE_ASSETS_SUCCESS = '[Success] Sync Scene Assets'

export const syncSceneAssetsSuccess = (scene: Scene) => action(SYNC_SCENE_ASSETS_SUCCESS, { scene })

export type SyncSceneAssetsSuccessAction = ReturnType<typeof syncSceneAssetsSuccess>

// Set Script Parameters

export const SET_SCRIPT_VALUES = 'Set Script Values'

export const setScriptValues = (entityId: string, values: AssetParameterValues) => action(SET_SCRIPT_VALUES, { entityId, values })

export type SetScriptValuesAction = ReturnType<typeof setScriptValues>
