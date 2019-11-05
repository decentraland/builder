import { action } from 'typesafe-actions'
import { Asset } from './types'
import { Scene } from 'modules/scene/types'

// Load collectibles

export const LOAD_COLLECTIBLES_REQUEST = '[Request] Load Collectibles'
export const LOAD_COLLECTIBLES_SUCCESS = '[Success] Load Collectibles'
export const LOAD_COLLECTIBLES_FAILURE = '[Failure] Load Collectibles'

export const loadCollectiblesRequest = () => action(LOAD_COLLECTIBLES_REQUEST, {})
export const loadCollectiblesSuccess = (assets: Asset[]) => action(LOAD_COLLECTIBLES_SUCCESS, { assets })
export const loadCollectiblesFailure = (error: string) => action(LOAD_COLLECTIBLES_FAILURE, { error })

export type LoadCollectiblesRequestAction = ReturnType<typeof loadCollectiblesRequest>
export type LoadCollectiblesSuccessAction = ReturnType<typeof loadCollectiblesSuccess>
export type LoadCollectiblesFailureAction = ReturnType<typeof loadCollectiblesFailure>

// Load assets
export const LOAD_SCENE_ASSETS = 'Load scene assets'
export const loadSceneAssets = (scene: Scene) => action(LOAD_SCENE_ASSETS, { scene })
export type LoadSceneAssetsAction = ReturnType<typeof loadSceneAssets>
