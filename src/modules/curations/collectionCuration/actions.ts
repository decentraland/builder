import { action } from 'typesafe-actions'
import { CollectionCuration } from './types'

// Fetch Collection Curations

export const FETCH_COLLECTION_CURATIONS_REQUEST = '[Request] Fetch Collection Curations'
export const FETCH_COLLECTION_CURATIONS_SUCCESS = '[Success] Fetch Collection Curations'
export const FETCH_COLLECTION_CURATIONS_FAILURE = '[Failure] Fetch Collection Curations'

export const fetchCollectionCurationsRequest = () => action(FETCH_COLLECTION_CURATIONS_REQUEST)
export const fetchCollectionCurationsSuccess = (curations: CollectionCuration[]) =>
  action(FETCH_COLLECTION_CURATIONS_SUCCESS, { curations })
export const fetchCollectionCurationsFailure = (error: string) => action(FETCH_COLLECTION_CURATIONS_FAILURE, { error })

export type FetchCollectionCurationsRequestAction = ReturnType<typeof fetchCollectionCurationsRequest>
export type FetchCollectionCurationsSuccessAction = ReturnType<typeof fetchCollectionCurationsSuccess>
export type FetchCollectionCurationsFailureAction = ReturnType<typeof fetchCollectionCurationsFailure>

// Fetch Collection Curation

export const FETCH_COLLECTION_CURATION_REQUEST = '[Request] Fetch Collection CollectionCuration'
export const FETCH_COLLECTION_CURATION_SUCCESS = '[Success] Fetch Collection CollectionCuration'
export const FETCH_COLLECTION_CURATION_FAILURE = '[Failure] Fetch Collection CollectionCuration'

export const fetchCollectionCurationRequest = (collectionId: string) => action(FETCH_COLLECTION_CURATION_REQUEST, { collectionId })
export const fetchCollectionCurationSuccess = (collectionId: string, curation?: CollectionCuration) =>
  action(FETCH_COLLECTION_CURATION_SUCCESS, { collectionId, curation })
export const fetchCollectionCurationFailure = (error: string) => action(FETCH_COLLECTION_CURATION_FAILURE, { error })

export type FetchCollectionCurationRequestAction = ReturnType<typeof fetchCollectionCurationRequest>
export type FetchCollectionCurationSuccessAction = ReturnType<typeof fetchCollectionCurationSuccess>
export type FetchCollectionCurationFailureAction = ReturnType<typeof fetchCollectionCurationFailure>

// Push Collection Curation

export const PUSH_COLLECTION_CURATION_REQUEST = '[Request] Push Collection CollectionCuration'
export const PUSH_COLLECTION_CURATION_SUCCESS = '[Success] Push Collection CollectionCuration'
export const PUSH_COLLECTION_CURATION_FAILURE = '[Failure] Push Collection CollectionCuration'

export const pushCollectionCurationRequest = (collectionId: string) => action(PUSH_COLLECTION_CURATION_REQUEST, { collectionId })
export const pushCollectionCurationSuccess = () => action(PUSH_COLLECTION_CURATION_SUCCESS)
export const pushCollectionCurationFailure = (error: string) => action(PUSH_COLLECTION_CURATION_FAILURE, { error })

export type PushCollectionCurationRequestAction = ReturnType<typeof pushCollectionCurationRequest>
export type PushCollectionCurationSuccessAction = ReturnType<typeof pushCollectionCurationSuccess>
export type PushCollectionCurationFailureAction = ReturnType<typeof pushCollectionCurationFailure>

// Approve Collection Curation

export const APPROVE_COLLECTION_CURATION_REQUEST = '[Request] Approve Collection Curation'
export const APPROVE_COLLECTION_CURATION_SUCCESS = '[Success] Approve Collection Curation'
export const APPROVE_COLLECTION_CURATION_FAILURE = '[Failure] Approve Collection Curation'

export const approveCollectionCurationRequest = (collectionId: string) => action(APPROVE_COLLECTION_CURATION_REQUEST, { collectionId })
export const approveCollectionCurationSuccess = (collectionId: string) => action(APPROVE_COLLECTION_CURATION_SUCCESS, { collectionId })
export const approveCollectionCurationFailure = (collectionId: string, error: string) =>
  action(APPROVE_COLLECTION_CURATION_FAILURE, { collectionId, error })

export type ApproveCollectionCurationRequestAction = ReturnType<typeof approveCollectionCurationRequest>
export type ApproveCollectionCurationSuccessAction = ReturnType<typeof approveCollectionCurationSuccess>
export type ApproveCollectionCurationFailureAction = ReturnType<typeof approveCollectionCurationFailure>

// Reject Collection Curation

export const REJECT_COLLECTION_CURATION_REQUEST = '[Request] Reject Collection Curation'
export const REJECT_COLLECTION_CURATION_SUCCESS = '[Success] Reject Collection Curation'
export const REJECT_COLLECTION_CURATION_FAILURE = '[Failure] Reject Collection Curation'

export const rejectCollectionCurationRequest = (collectionId: string) => action(REJECT_COLLECTION_CURATION_REQUEST, { collectionId })
export const rejectCollectionCurationSuccess = (collectionId: string) => action(REJECT_COLLECTION_CURATION_SUCCESS, { collectionId })
export const rejectCollectionCurationFailure = (collectionId: string, error: string) =>
  action(REJECT_COLLECTION_CURATION_FAILURE, { collectionId, error })

export type RejectCollectionCurationRequestAction = ReturnType<typeof rejectCollectionCurationRequest>
export type RejectCollectionCurationSuccessAction = ReturnType<typeof rejectCollectionCurationSuccess>
export type RejectCollectionFailureSuccessAction = ReturnType<typeof rejectCollectionCurationFailure>
