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

// Fetch Curation

export const FETCH_CURATION_REQUEST = '[Request] Fetch Curation'
export const FETCH_CURATION_SUCCESS = '[Success] Fetch Curation'
export const FETCH_CURATION_FAILURE = '[Failure] Fetch Curation'

export const fetchCurationRequest = (collectionId: string) => action(FETCH_CURATION_REQUEST, { collectionId })
export const fetchCurationSuccess = (collectionId: string, curation?: Curation) =>
  action(FETCH_CURATION_SUCCESS, { collectionId, curation })
export const fetchCurationFailure = (error: string) => action(FETCH_CURATION_FAILURE, { error })

export type FetchCurationRequestAction = ReturnType<typeof fetchCurationRequest>
export type FetchCurationSuccessAction = ReturnType<typeof fetchCurationSuccess>
export type FetchCurationFailureAction = ReturnType<typeof fetchCurationFailure>

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

// Approve Curation

export const APPROVE_CURATION_REQUEST = '[Request] Approve Curation'
export const APPROVE_CURATION_SUCCESS = '[Success] Approve Curation'
export const APPROVE_CURATION_FAILURE = '[Failure] Approve Curation'

export const approveCurationRequest = (collectionId: string) => action(APPROVE_CURATION_REQUEST, { collectionId })
export const approveCurationSuccess = () => action(APPROVE_CURATION_SUCCESS)
export const approveCurationFailure = (error: string) => action(APPROVE_CURATION_FAILURE, { error })

export type ApproveCurationRequestAction = ReturnType<typeof approveCurationRequest>
export type ApproveCurationSuccessAction = ReturnType<typeof approveCurationSuccess>
export type ApproveCurationFailureAction = ReturnType<typeof approveCurationFailure>

// Reject Curation

export const REJECT_CURATION_REQUEST = '[Request] Reject Curation'
export const REJECT_CURATION_SUCCESS = '[Success] Reject Curation'
export const REJECT_CURATION_FAILURE = '[Failure] Reject Curation'

export const rejectCurationRequest = (collectionId: string) => action(REJECT_CURATION_REQUEST, { collectionId })
export const rejectCurationSuccess = () => action(REJECT_CURATION_SUCCESS)
export const rejectCurationFailure = (error: string) => action(REJECT_CURATION_FAILURE, { error })

export type RejectCurationRequestAction = ReturnType<typeof rejectCurationRequest>
export type RejectCurationSuccessAction = ReturnType<typeof rejectCurationSuccess>
export type RejectCurationFailureAction = ReturnType<typeof rejectCurationFailure>