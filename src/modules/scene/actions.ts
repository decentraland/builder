import { action } from 'typesafe-actions'
import { Vector3 } from 'modules/common/types'
import { SceneDefinition } from './types'
import { AssetResource } from 'modules/assetpack/types'

// Create scene

export const CREATE_SCENE = 'Create scene'

export const createScene = (scene: SceneDefinition) => action(CREATE_SCENE, { scene })

export type CreateSceneAction = ReturnType<typeof createScene>

// Spawn items

export const ADD_ASSET = 'Add asset'

export const addAsset = (asset: AssetResource, position: Vector3) => action(ADD_ASSET, { asset, position })

export type AddAssetAction = ReturnType<typeof addAsset>

// Add entities/components

export const ADD_REFERENCES = 'Add references'

export const addReferences = (sceneId: string, entities: string[], components: string[]) =>
  action(ADD_REFERENCES, { sceneId, entities, components })

export type AddReferencesAction = ReturnType<typeof addReferences>
