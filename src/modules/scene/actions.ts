import { action } from 'typesafe-actions'
import { Vector3 } from 'modules/common/types'
import { Asset } from 'modules/asset/types'
import { Scene, SceneMetrics, ComponentType, ComponentData } from './types'
import { Layout } from 'modules/project/types'

// Create a scene (doesn't trigger ECS re-render)

export const CREATE_SCENE = 'Provision scene'

export const createScene = (newScene: Scene) => action(CREATE_SCENE, { newScene })

export type CreateSceneAction = ReturnType<typeof createScene>

// Provision a scene

export const PROVISION_SCENE = 'Provision scene'

export const provisionScene = (newScene: Scene) => action(PROVISION_SCENE, { newScene })

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

export const setGround = (projectId: string, layout?: Layout, asset?: Asset) => action(SET_GROUND, { projectId, layout, asset })

export type SetGroundAction = ReturnType<typeof setGround>
