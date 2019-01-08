import { action } from 'typesafe-actions'
import { AssetPack } from './types'

// Load Asset Packs

export const LOAD_ASSET_PACKS_REQUEST = '[Request] Load Asset Packs'
export const LOAD_ASSET_PACKS_SUCCESS = '[Success] Load Asset Packs'
export const LOAD_ASSET_PACKS_FAILURE = '[Failure] Load Asset Packs'

export const loadAssetPacksRequest = () => action(LOAD_ASSET_PACKS_REQUEST, {})
export const loadAssetPacksSuccess = (assetPacks: AssetPack[]) => action(LOAD_ASSET_PACKS_SUCCESS, { assetPacks })
export const loadAssetPacksFailure = (error: string) => action(LOAD_ASSET_PACKS_FAILURE, { error })

export type LoadAssetPacksRequestAction = ReturnType<typeof loadAssetPacksRequest>
export type LoadAssetPacksSuccessAction = ReturnType<typeof loadAssetPacksSuccess>
export type LoadAssetPacksFailureAction = ReturnType<typeof loadAssetPacksFailure>
