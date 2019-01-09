import { action } from 'typesafe-actions'
import { Vector3 } from 'modules/common/types'
import { SceneDefinition, EntityDefinition, AnyComponent } from './types'
import { AssetResource } from 'modules/assetPack/types'

// Create scene

export const CREATE_SCENE = 'Create scene'

export const createScene = (scene: SceneDefinition) => action(CREATE_SCENE, { scene })

export type CreateSceneAction = ReturnType<typeof createScene>

// Spawn items

export const ADD_ASSET = 'Add asset'

export const addAsset = (asset: AssetResource, position: Vector3) => action(ADD_ASSET, { asset, position })

export type AddAssetAction = ReturnType<typeof addAsset>

// Add component

export const ADD_COMPONENT = 'Add component'

export const addComponent = (sceneId: string, component: AnyComponent) => action(ADD_COMPONENT, { sceneId, component })

export type AddComponentAction = ReturnType<typeof addComponent>

// Add entity

export const ADD_ENTITY = 'Add entity'

export const addEntity = (sceneId: string, entity: EntityDefinition) => action(ADD_ENTITY, { sceneId, entity })

export type AddEntityAction = ReturnType<typeof addEntity>
