import { action } from 'typesafe-actions'
import { Asset } from './types'

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
export const LOAD_ASSETS = 'Load assets'
export const loadAssets = (assets: Record<string, Asset>) => action(LOAD_ASSETS, { assets })
export type LoadAssetsAction = ReturnType<typeof loadAssets>
