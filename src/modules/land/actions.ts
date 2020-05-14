import { action } from 'typesafe-actions'
import { Land } from './types'

export const FETCH_LAND_REQUEST = '[Request] Fetch Land'
export const FETCH_LAND_SUCCESS = '[Success] Fetch Land'
export const FETCH_LAND_FAILURE = '[Failure] Fetch Land'

export const fetchLandRequest = (address: string) => action(FETCH_LAND_REQUEST, { address })
export const fetchLandSuccess = (address: string, land: Land[]) => action(FETCH_LAND_SUCCESS, { address, land })
export const fetchLandFailure = (address: string, error: string) => action(FETCH_LAND_FAILURE, { address, error })

export type FetchLandRequestAction = ReturnType<typeof fetchLandRequest>
export type FetchLandSuccessAction = ReturnType<typeof fetchLandSuccess>
export type FetchLandFailureAction = ReturnType<typeof fetchLandFailure>
