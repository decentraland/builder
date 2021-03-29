import { action } from 'typesafe-actions'
import { ChainId } from '@dcl/schemas'
import { buildTransactionPayload } from 'decentraland-dapps/dist/modules/transaction/utils'
import { Item } from 'modules/item/types'
import { Collection, Mint, Access } from './types'

// Fetch collections

export const FETCH_COLLECTIONS_REQUEST = '[Request] Fetch Collections'
export const FETCH_COLLECTIONS_SUCCESS = '[Success] Fetch Collections'
export const FETCH_COLLECTIONS_FAILURE = '[Failure] Fetch Collections'

export const fetchCollectionsRequest = (address?: string) => action(FETCH_COLLECTIONS_REQUEST, { address })
export const fetchCollectionsSuccess = (collections: Collection[]) => action(FETCH_COLLECTIONS_SUCCESS, { collections })
export const fetchCollectionsFailure = (error: string) => action(FETCH_COLLECTIONS_FAILURE, { error })

export type FetchCollectionsRequestAction = ReturnType<typeof fetchCollectionsRequest>
export type FetchCollectionsSuccessAction = ReturnType<typeof fetchCollectionsSuccess>
export type FetchCollectionsFailureAction = ReturnType<typeof fetchCollectionsFailure>

// Fetch collection

export const FETCH_COLLECTION_REQUEST = '[Request] Fetch Collection'
export const FETCH_COLLECTION_SUCCESS = '[Success] Fetch Collection'
export const FETCH_COLLECTION_FAILURE = '[Failure] Fetch Collection'

export const fetchCollectionRequest = (id: string) => action(FETCH_COLLECTION_REQUEST, { id })
export const fetchCollectionSuccess = (id: string, collection: Collection) => action(FETCH_COLLECTION_SUCCESS, { id, collection })
export const fetchCollectionFailure = (id: string, error: string) => action(FETCH_COLLECTION_FAILURE, { id, error })

export type FetchCollectionRequestAction = ReturnType<typeof fetchCollectionRequest>
export type FetchCollectionSuccessAction = ReturnType<typeof fetchCollectionSuccess>
export type FetchCollectionFailureAction = ReturnType<typeof fetchCollectionFailure>

// Save collection

export const SAVE_COLLECTION_REQUEST = '[Request] Save Collection'
export const SAVE_COLLECTION_SUCCESS = '[Success] Save Collection'
export const SAVE_COLLECTION_FAILURE = '[Failure] Save Collection'

export const saveCollectionRequest = (collection: Collection) => action(SAVE_COLLECTION_REQUEST, { collection })
export const saveCollectionSuccess = (collection: Collection) => action(SAVE_COLLECTION_SUCCESS, { collection })
export const saveCollectionFailure = (collection: Collection, error: string) => action(SAVE_COLLECTION_FAILURE, { collection, error })

export type SaveCollectionRequestAction = ReturnType<typeof saveCollectionRequest>
export type SaveCollectionSuccessAction = ReturnType<typeof saveCollectionSuccess>
export type SaveCollectionFailureAction = ReturnType<typeof saveCollectionFailure>

// Delete collection

export const DELETE_COLLECTION_REQUEST = '[Request] Delete Collection'
export const DELETE_COLLECTION_SUCCESS = '[Success] Delete Collection'
export const DELETE_COLLECTION_FAILURE = '[Failure] Delete Collection'

export const deleteCollectionRequest = (collection: Collection) => action(DELETE_COLLECTION_REQUEST, { collection })
export const deleteCollectionSuccess = (collection: Collection) => action(DELETE_COLLECTION_SUCCESS, { collection })
export const deleteCollectionFailure = (collection: Collection, error: string) => action(DELETE_COLLECTION_FAILURE, { collection, error })

export type DeleteCollectionRequestAction = ReturnType<typeof deleteCollectionRequest>
export type DeleteCollectionSuccessAction = ReturnType<typeof deleteCollectionSuccess>
export type DeleteCollectionFailureAction = ReturnType<typeof deleteCollectionFailure>

// Publish collection

export const PUBLISH_COLLECTION_REQUEST = '[Request] Publish Collection'
export const PUBLISH_COLLECTION_SUCCESS = '[Success] Publish Collection'
export const PUBLISH_COLLECTION_FAILURE = '[Failure] Publish Collection'

export const publishCollectionRequest = (collection: Collection, items: Item[]) => action(PUBLISH_COLLECTION_REQUEST, { collection, items })
export const publishCollectionSuccess = (collection: Collection, items: Item[], chainId: ChainId, txHash: string) =>
  action(PUBLISH_COLLECTION_SUCCESS, {
    collection,
    items,
    ...buildTransactionPayload(chainId, txHash, { collection, items })
  })
export const publishCollectionFailure = (collection: Collection, items: Item[], error: string) =>
  action(PUBLISH_COLLECTION_FAILURE, { collection, items, error })

export type PublishCollectionRequestAction = ReturnType<typeof publishCollectionRequest>
export type PublishCollectionSuccessAction = ReturnType<typeof publishCollectionSuccess>
export type PublishCollectionFailureAction = ReturnType<typeof publishCollectionFailure>

// Mint collection tokens

export const MINT_COLLECTION_ITEMS_REQUEST = '[Request] Mint collection items'
export const MINT_COLLECTION_ITEMS_SUCCESS = '[Success] Mint collection items'
export const MINT_COLLECTION_ITEMS_FAILURE = '[Failure] Mint collection items'

export const mintCollectionItemsRequest = (collection: Collection, mints: Mint[]) =>
  action(MINT_COLLECTION_ITEMS_REQUEST, { collection, mints })
export const mintCollectionItemsSuccess = (collection: Collection, mints: Mint[], chainId: ChainId, txHash: string) =>
  action(MINT_COLLECTION_ITEMS_SUCCESS, {
    collection,
    mints,
    ...buildTransactionPayload(chainId, txHash, { collection, mints })
  })
export const mintCollectionItemsFailure = (collection: Collection, mints: Mint[], error: string) =>
  action(MINT_COLLECTION_ITEMS_FAILURE, { collection, mints, error })

export type MintCollectionItemsRequestAction = ReturnType<typeof mintCollectionItemsRequest>
export type MintCollectionItemsSuccessAction = ReturnType<typeof mintCollectionItemsSuccess>
export type MintCollectionItemsFailureAction = ReturnType<typeof mintCollectionItemsFailure>

// Set collection minters

export const SET_COLLECTION_MINTERS_REQUEST = '[Request] Set collection minters'
export const SET_COLLECTION_MINTERS_SUCCESS = '[Success] Set collection minters'
export const SET_COLLECTION_MINTERS_FAILURE = '[Failure] Set collection minters'

export const setCollectionMintersRequest = (collection: Collection, accessList: Access[]) =>
  action(SET_COLLECTION_MINTERS_REQUEST, { collection, accessList })
export const setCollectionMintersSuccess = (collection: Collection, minters: string[], chainId: ChainId, txHash: string) =>
  action(SET_COLLECTION_MINTERS_SUCCESS, {
    collection,
    minters,
    ...buildTransactionPayload(chainId, txHash, { collection, minters })
  })
export const setCollectionMintersFailure = (collection: Collection, accessList: Access[], error: string) =>
  action(SET_COLLECTION_MINTERS_FAILURE, { collection, accessList, error })

export type SetCollectionMintersRequestAction = ReturnType<typeof setCollectionMintersRequest>
export type SetCollectionMintersSuccessAction = ReturnType<typeof setCollectionMintersSuccess>
export type SetCollectionMintersFailureAction = ReturnType<typeof setCollectionMintersFailure>

// Set collection minters

export const SET_COLLECTION_MANAGERS_REQUEST = '[Request] Set collection managers'
export const SET_COLLECTION_MANAGERS_SUCCESS = '[Success] Set collection managers'
export const SET_COLLECTION_MANAGERS_FAILURE = '[Failure] Set collection managers'

export const setCollectionManagersRequest = (collection: Collection, accessList: Access[]) =>
  action(SET_COLLECTION_MANAGERS_REQUEST, { collection, accessList })
export const setCollectionManagersSuccess = (collection: Collection, managers: string[], chainId: ChainId, txHash: string) =>
  action(SET_COLLECTION_MANAGERS_SUCCESS, {
    collection,
    managers,
    ...buildTransactionPayload(chainId, txHash, { collection, managers })
  })
export const setCollectionManagersFailure = (collection: Collection, accessList: Access[], error: string) =>
  action(SET_COLLECTION_MANAGERS_FAILURE, { collection, accessList, error })

export type SetCollectionManagersRequestAction = ReturnType<typeof setCollectionManagersRequest>
export type SetCollectionManagersSuccessAction = ReturnType<typeof setCollectionManagersSuccess>
export type SetCollectionManagersFailureAction = ReturnType<typeof setCollectionManagersFailure>

// Approve collection

export const APPROVE_COLLECTION_REQUEST = '[Request] Approve collection'
export const APPROVE_COLLECTION_SUCCESS = '[Success] Approve collection'
export const APPROVE_COLLECTION_FAILURE = '[Failure] Approve collection'

export const approveCollectionRequest = (collection: Collection) => action(APPROVE_COLLECTION_REQUEST, { collection })
export const approveCollectionSuccess = (collection: Collection, chainId: ChainId, txHash: string) =>
  action(APPROVE_COLLECTION_SUCCESS, {
    collection,
    ...buildTransactionPayload(chainId, txHash, { collection })
  })
export const approveCollectionFailure = (collection: Collection, error: string) => action(APPROVE_COLLECTION_FAILURE, { collection, error })

export type ApproveCollectionRequestAction = ReturnType<typeof approveCollectionRequest>
export type ApproveCollectionSuccessAction = ReturnType<typeof approveCollectionSuccess>
export type ApproveCollectionFailureAction = ReturnType<typeof approveCollectionFailure>

// Reject collection

export const REJECT_COLLECTION_REQUEST = '[Request] Reject collection'
export const REJECT_COLLECTION_SUCCESS = '[Success] Reject collection'
export const REJECT_COLLECTION_FAILURE = '[Failure] Reject collection'

export const rejectCollectionRequest = (collection: Collection) => action(REJECT_COLLECTION_REQUEST, { collection })
export const rejectCollectionSuccess = (collection: Collection, chainId: ChainId, txHash: string) =>
  action(REJECT_COLLECTION_SUCCESS, {
    collection,
    ...buildTransactionPayload(chainId, txHash, { collection })
  })
export const rejectCollectionFailure = (collection: Collection, error: string) => action(REJECT_COLLECTION_FAILURE, { collection, error })

export type RejectCollectionRequestAction = ReturnType<typeof rejectCollectionRequest>
export type RejectCollectionSuccessAction = ReturnType<typeof rejectCollectionSuccess>
export type RejectCollectionFailureAction = ReturnType<typeof rejectCollectionFailure>
