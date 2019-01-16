import { action } from 'typesafe-actions'
import { Vector3 } from 'modules/common/types'
import { AssetResource } from 'modules/asset/types'
import { SceneDefinition, EntityDefinition, AnyComponent } from './types'

// Create scene

export const CREATE_SCENE = 'Create scene'

export const createScene = (scene: SceneDefinition) => action(CREATE_SCENE, { scene })

export type CreateSceneAction = ReturnType<typeof createScene>

// Spawn items

export const ADD_ASSET = 'Add asset'

export const addAsset = (asset: AssetResource, position: Vector3) => action(ADD_ASSET, { asset, position })

export type AddAssetAction = ReturnType<typeof addAsset>

// Provision a scene: add components and entities

export const PROVISION_SCENE = 'Provision scene'

export const provisionScene = (sceneId: string, components: AnyComponent[], entities: EntityDefinition[]) =>
  action(PROVISION_SCENE, { sceneId, components, entities })

export type ProvisionSceneAction = ReturnType<typeof provisionScene>
