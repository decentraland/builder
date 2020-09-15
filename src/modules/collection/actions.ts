import { action } from 'typesafe-actions'
import { buildTransactionPayload } from 'decentraland-dapps/dist/modules/transaction/utils'
import { Item } from 'modules/item/types'
import { Collection } from './types'

// Fetch collections

export const FETCH_COLLECTIONS_REQUEST = '[Request] Fetch Collections'
export const FETCH_COLLECTIONS_SUCCESS = '[Success] Fetch Collections'
export const FETCH_COLLECTIONS_FAILURE = '[Failure] Fetch Collections'

export const fetchCollectionsRequest = () => action(FETCH_COLLECTIONS_REQUEST)
export const fetchCollectionsSuccess = (collections: Collection[]) => action(FETCH_COLLECTIONS_SUCCESS, { collections })
export const fetchCollectionsFailure = (error: string) => action(FETCH_COLLECTIONS_FAILURE, { error })

export type FetchCollectionsRequestAction = ReturnType<typeof fetchCollectionsRequest>
export type FetchCollectionsSuccessAction = ReturnType<typeof fetchCollectionsSuccess>
export type FetchCollectionsFailureAction = ReturnType<typeof fetchCollectionsFailure>

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
export const publishCollectionSuccess = (collection: Collection, items: Item[], txHash: string) =>
  action(PUBLISH_COLLECTION_SUCCESS, {
    collection,
    items,
    ...buildTransactionPayload(txHash, { collection, items })
  })
export const publishCollectionFailure = (collection: Collection, items: Item[], error: string) =>
  action(PUBLISH_COLLECTION_FAILURE, { collection, items, error })

export type PublishCollectionRequestAction = ReturnType<typeof publishCollectionRequest>
export type PublishCollectionSuccessAction = ReturnType<typeof publishCollectionSuccess>
export type PublishCollectionFailureAction = ReturnType<typeof publishCollectionFailure>
