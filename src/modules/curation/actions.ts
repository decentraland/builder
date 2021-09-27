import { action } from 'typesafe-actions'
import { Curation } from './types'

export const FETCH_CURATIONS_REQUEST = '[Request] Fetch Curations'
export const FETCH_CURATIONS_SUCCESS = '[Success] Fetch Curations'
export const FETCH_CURATIONS_FAILURE = '[Failure] Fetch Curations'

export const fetchCurationsRequest = () => action(FETCH_CURATIONS_REQUEST)
export const fetchCurationsSuccess = (curations: Curation[]) => action(FETCH_CURATIONS_SUCCESS, { curations })
export const fetchCurationsFailure = (error: string) => action(FETCH_CURATIONS_FAILURE, { error })

export type FetchCurationsRequestAction = ReturnType<typeof fetchCurationsRequest>
export type FetchCurationsSuccessAction = ReturnType<typeof fetchCurationsSuccess>
export type FetchCurationsFailureAction = ReturnType<typeof fetchCurationsFailure>
