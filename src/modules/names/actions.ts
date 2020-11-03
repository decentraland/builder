import { action } from 'typesafe-actions'
import { Name } from './types'

export const FETCH_NAMES_REQUEST = '[Request] Fetch Names'
export const FETCH_NAMES_SUCCESS = '[Success] Fetch Names'
export const FETCH_NAMES_FAILURE = '[Failure] Fetch Names'

export const fetchNamesRequest = (address: string, page: number) => action(FETCH_NAMES_REQUEST, { address, page })
export const fetchNamesSuccess = (address: string, names: Name[], total: number) => action(FETCH_NAMES_SUCCESS, { address, names, total })
export const fetchNamesFailure = (address: string, error: string) => action(FETCH_NAMES_FAILURE, { address, error })

export type FetchNamesRequestAction = ReturnType<typeof fetchNamesRequest>
export type FetchNamesSuccessAction = ReturnType<typeof fetchNamesSuccess>
export type FetchNamesFailureAction = ReturnType<typeof fetchNamesFailure>
