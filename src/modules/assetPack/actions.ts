import { action } from 'typesafe-actions'
import { RawAssetContents } from 'modules/asset/types'
import { FullAssetPack, ProgressStage } from './types'

// Load Asset Packs

export const LOAD_ASSET_PACKS_REQUEST = '[Request] Load Asset Packs'
export const LOAD_ASSET_PACKS_SUCCESS = '[Success] Load Asset Packs'
export const LOAD_ASSET_PACKS_FAILURE = '[Failure] Load Asset Packs'

export const loadAssetPacksRequest = () => action(LOAD_ASSET_PACKS_REQUEST, {})
export const loadAssetPacksSuccess = (assetPacks: FullAssetPack[]) => action(LOAD_ASSET_PACKS_SUCCESS, { assetPacks })
export const loadAssetPacksFailure = (error: string) => action(LOAD_ASSET_PACKS_FAILURE, { error })

export type LoadAssetPacksRequestAction = ReturnType<typeof loadAssetPacksRequest>
export type LoadAssetPacksSuccessAction = ReturnType<typeof loadAssetPacksSuccess>
export type LoadAssetPacksFailureAction = ReturnType<typeof loadAssetPacksFailure>

// Save AssetPack

export const SAVE_ASSET_PACK_REQUEST = '[Request] Save AssetPack'
export const SAVE_ASSET_PACK_SUCCESS = '[Success] Save AssetPack'
export const SAVE_ASSET_PACK_FAILURE = '[Failure] Save AssetPack'

export const saveAssetPackRequest = (assetPack: FullAssetPack, contents: RawAssetContents) =>
  action(SAVE_ASSET_PACK_REQUEST, { assetPack, contents })
export const saveAssetPackSuccess = (assetPack: FullAssetPack) => action(SAVE_ASSET_PACK_SUCCESS, { assetPack })
export const saveAssetPackFailure = (assetPack: FullAssetPack, error: string) => action(SAVE_ASSET_PACK_FAILURE, { assetPack, error })

export type SaveAssetPackRequestAction = ReturnType<typeof saveAssetPackRequest>
export type SaveAssetPackSuccessAction = ReturnType<typeof saveAssetPackSuccess>
export type SaveAssetPackFailureAction = ReturnType<typeof saveAssetPackFailure>

// Set AssetPack upload progress

export const SET_PROGRESS = 'Set AssetPack progress'
export const setProgress = (stage: ProgressStage, value: number) => action(SET_PROGRESS, { stage, value })
export type SetProgressAction = ReturnType<typeof setProgress>

// Delete AssetPack

export const DELETE_ASSET_PACK_REQUEST = '[Request] Delete AssetPack'
export const DELETE_ASSET_PACK_SUCCESS = '[Success] Delete AssetPack'
export const DELETE_ASSET_PACK_FAILURE = '[Failure] Delete AssetPack'

export const deleteAssetPackRequest = (assetPack: FullAssetPack) => action(DELETE_ASSET_PACK_REQUEST, { assetPack })
export const deleteAssetPackSuccess = (assetPack: FullAssetPack) => action(DELETE_ASSET_PACK_SUCCESS, { assetPack })
export const deleteAssetPackFailure = (assetPack: FullAssetPack, error: string) => action(DELETE_ASSET_PACK_FAILURE, { assetPack, error })

export type DeleteAssetPackRequestAction = ReturnType<typeof deleteAssetPackRequest>
export type DeleteAssetPackSuccessAction = ReturnType<typeof deleteAssetPackSuccess>
export type DeleteAssetPackFailureAction = ReturnType<typeof deleteAssetPackFailure>

// Clear Asset Packs
export const CLEAR_ASSET_PACKS = 'Clear Asset Packs'
export const clearAssetPacks = () => action(CLEAR_ASSET_PACKS)
export type ClearAssetPacksAction = ReturnType<typeof clearAssetPacks>
