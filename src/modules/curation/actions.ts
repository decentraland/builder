import { action } from 'typesafe-actions'
import { Curation } from './types'

// Fetch Curations

export const FETCH_CURATIONS_REQUEST = '[Request] Fetch Curations'
export const FETCH_CURATIONS_SUCCESS = '[Success] Fetch Curations'
export const FETCH_CURATIONS_FAILURE = '[Failure] Fetch Curations'

export const fetchCurationsRequest = () => action(FETCH_CURATIONS_REQUEST)
export const fetchCurationsSuccess = (curations: Curation[]) => action(FETCH_CURATIONS_SUCCESS, { curations })
export const fetchCurationsFailure = (error: string) => action(FETCH_CURATIONS_FAILURE, { error })

export type FetchCurationsRequestAction = ReturnType<typeof fetchCurationsRequest>
export type FetchCurationsSuccessAction = ReturnType<typeof fetchCurationsSuccess>
export type FetchCurationsFailureAction = ReturnType<typeof fetchCurationsFailure>

// Push Curation

export const PUSH_CURATION_REQUEST = '[Request] Push Curation'
export const PUSH_CURATION_SUCCESS = '[Success] Push Curation'
export const PUSH_CURATION_FAILURE = '[Failure] Push Curation'

export const pushCurationRequest = (collectionId: string) => action(PUSH_CURATION_REQUEST, { collectionId })
export const pushCurationSuccess = () => action(PUSH_CURATION_SUCCESS)
export const pushCurationFailure = (error: string) => action(PUSH_CURATION_FAILURE, { error })

export type PushCurationRequestAction = ReturnType<typeof pushCurationRequest>
export type PushCurationSuccessAction = ReturnType<typeof pushCurationSuccess>
export type PushCurationFailureAction = ReturnType<typeof pushCurationFailure>
