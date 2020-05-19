import { action } from 'typesafe-actions'
import { Land } from './types'

export const FETCH_LANDS_REQUEST = '[Request] Fetch Lands'
export const FETCH_LANDS_SUCCESS = '[Success] Fetch Lands'
export const FETCH_LANDS_FAILURE = '[Failure] Fetch Lands'

export const fetchLandsRequest = (address: string) => action(FETCH_LANDS_REQUEST, { address })
export const fetchLandsSuccess = (address: string, lands: Land[]) => action(FETCH_LANDS_SUCCESS, { address, lands })
export const fetchLandsFailure = (address: string, error: string) => action(FETCH_LANDS_FAILURE, { address, error })

export type FetchLandsRequestAction = ReturnType<typeof fetchLandsRequest>
export type FetchLandsSuccessAction = ReturnType<typeof fetchLandsSuccess>
export type FetchLandsFailureAction = ReturnType<typeof fetchLandsFailure>
