import { action } from 'typesafe-actions'

import { ModelById } from 'decentraland-dapps/dist/lib/types'
import { Pool } from 'modules/pool/types'

// Load cloud pools

export const LOAD_POOLS_REQUEST = '[Request] Load pools'
export const LOAD_POOLS_SUCCESS = '[Success] Load pools'
export const LOAD_POOLS_FAILURE = '[Failure] Load pools'

export const loadPoolsRequest = () => action(LOAD_POOLS_REQUEST, {})
export const loadPoolsSuccess = (pool: ModelById<Pool>) => action(LOAD_POOLS_SUCCESS, { projects: pool })
export const loadPoolsFailure = (error: string) => action(LOAD_POOLS_FAILURE, { error })

export type LoadPoolsRequestAction = ReturnType<typeof loadPoolsRequest>
export type LoadPoolsSuccessAction = ReturnType<typeof loadPoolsSuccess>
export type LoadPoolsFailureAction = ReturnType<typeof loadPoolsFailure>


// Like pool

export const LIKE_POOL_REQUEST = '[Request] Like pool'
export const LIKE_POOL_SUCCESS = '[Success] Like pool'
export const LIKE_POOL_FAILURE = '[Failure] Like pool'

export const likePoolRequest = (pool: string, like: boolean) => action(LIKE_POOL_REQUEST, { pool, like })
export const likePoolSuccess = () => action(LIKE_POOL_SUCCESS, {})
export const likePoolFailure = (error: string) => action(LIKE_POOL_FAILURE, { error })

export type LikePoolRequestAction = ReturnType<typeof likePoolRequest>
export type LikePoolSuccessAction = ReturnType<typeof likePoolSuccess>
export type LikePoolFailureAction = ReturnType<typeof likePoolFailure>
