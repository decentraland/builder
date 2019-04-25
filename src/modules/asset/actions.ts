import { action } from 'typesafe-actions'
import { Asset } from './types'

// Load collectibles

export const LOAD_COLLECTIBLES_REQUEST = '[Request] Load Collectibles'
export const LOAD_COLLECTIBLES_SUCCESS = '[Success] Load Collectibles'
export const LOAD_COLLECTIBLES_FAILURE = '[Failure] Load Collectibles'

export const loadCollectiblesRequest = (owner: string = 'asd', contract: string = '0x06012c8cf97bead5deae237070f9587f8e7a266d') =>
  action(LOAD_COLLECTIBLES_REQUEST, { owner, contract })
export const loadCollectiblesSuccess = (assets: Asset[]) => action(LOAD_COLLECTIBLES_SUCCESS, { assets })
export const loadCollectiblesFailure = (error: string) => action(LOAD_COLLECTIBLES_FAILURE, { error })

export type LoadCollectiblesRequestAction = ReturnType<typeof loadCollectiblesRequest>
export type LoadCollectiblesSuccessAction = ReturnType<typeof loadCollectiblesSuccess>
export type LoadCollectiblesFailureAction = ReturnType<typeof loadCollectiblesFailure>

// Force Load collectible

export const FORCE_LOAD_COLLECTIBLE_REQUEST = '[Request] Force Load Collectible'
export const FORCE_LOAD_COLLECTIBLE_SUCCESS = '[Success] Force Load Collectible'
export const FORCE_LOAD_COLLECTIBLE_FAILURE = '[Failure] Force Load Collectible'

export const forceLoadCollectibleRequest = (contract: string = '0x06012c8cf97bead5deae237070f9587f8e7a266d', tokenId: string) =>
  action(FORCE_LOAD_COLLECTIBLE_REQUEST, { tokenId, contract })
export const forceLoadCollectibleSuccess = (asset: Asset) => action(FORCE_LOAD_COLLECTIBLE_SUCCESS, { asset })
export const forceLoadCollectibleFailure = (error: string) => action(FORCE_LOAD_COLLECTIBLE_FAILURE, { error })

export type ForceLoadCollectibleRequestAction = ReturnType<typeof forceLoadCollectibleRequest>
export type ForceLoadCollectibleSuccessAction = ReturnType<typeof forceLoadCollectibleSuccess>
export type ForceLoadCollectibleFailureAction = ReturnType<typeof forceLoadCollectibleFailure>
