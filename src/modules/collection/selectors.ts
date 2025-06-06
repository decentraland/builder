import { createSelector } from 'reselect'
import { ChainId } from '@dcl/schemas'
import { ContractName, getContract } from 'decentraland-transactions'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { AuthorizationStepStatus } from 'decentraland-ui'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { Transaction } from 'decentraland-dapps/dist/modules/transaction/types'
import { getType } from 'decentraland-dapps/dist/modules/loading/utils'
import { RootState } from 'modules/common/types'
import { getPendingTransactions } from 'modules/transaction/selectors'
import { getItems, getStatusByItemId, getCollectionItems, getMissingEntities } from 'modules/item/selectors'
import { Item, SyncStatus } from 'modules/item/types'
import { getCurationsByCollectionId } from 'modules/curations/collectionCuration/selectors'
import { CollectionCuration } from 'modules/curations/collectionCuration/types'
import { getCollectionThirdParty, getData as getThirdParties } from 'modules/thirdParty/selectors'
import { getThirdPartyForCollection, isUserManagerOfThirdParty } from 'modules/thirdParty/utils'
import { CREATE_COLLECTION_FORUM_POST_REQUEST } from 'modules/forum/actions'
import { ThirdParty } from 'modules/thirdParty/types'
import { isEqual } from 'lib/address'
import { isThirdParty } from 'lib/urn'
import {
  SET_COLLECTION_MINTERS_SUCCESS,
  APPROVE_COLLECTION_SUCCESS,
  REJECT_COLLECTION_SUCCESS,
  PUBLISH_COLLECTION_REQUEST,
  PUBLISH_COLLECTION_SUCCESS
} from './actions'
import { CollectionState } from './reducer'
import {
  canSeeCollection,
  getCollectionType,
  getMostRelevantStatus,
  canManageCollectionItems,
  sortCollectionByCreatedAt,
  UNSYNCED_COLLECTION_ERROR_PREFIX
} from './utils'
import { Collection, CollectionType } from './types'

export const getState = (state: RootState) => state.collection
export const getData = (state: RootState) => getState(state).data
export const getLoading = (state: RootState) => getState(state).loading
export const getPaginationData = (state: RootState) => getState(state).pagination
export const getLastFetchParams = (state: RootState) => getState(state).lastFetchParams
export const getError = (state: RootState) => getState(state).error

export const getPaginatedCollections = (state: RootState, pageSize?: number) => {
  const paginationData = getPaginationData(state)
  const allCollections = getData(state)
  const ids = paginationData ? (pageSize ? paginationData.ids.slice(0, pageSize) : paginationData.ids) : []
  return ids.map(id => allCollections[id]).filter(Boolean)
}

export const getUnsyncedCollectionError = (state: RootState) => {
  const error = getError(state)
  if (!error || !error.startsWith(UNSYNCED_COLLECTION_ERROR_PREFIX)) {
    return null
  }
  return error
}

export const getCollections = createSelector<RootState, CollectionState['data'], string | undefined, Collection[]>(
  getData,
  getAddress,
  collectionData => Object.values(collectionData).sort(sortCollectionByCreatedAt)
)

export const getWalletCollections = createSelector<RootState, Collection[], string | undefined, Collection[]>(
  getCollections,
  getAddress,
  (collections, address) => collections.filter(collection => address && isEqual(collection.owner, address))
)

export const getAuthorizedCollections = createSelector<
  RootState,
  Collection[],
  string | undefined,
  Record<string, ThirdParty>,
  Collection[]
>(getCollections, getAddress, getThirdParties, (collections, address, thirdParties) =>
  collections.filter(collection => {
    const type = getCollectionType(collection)
    switch (type) {
      case CollectionType.STANDARD:
        return address && canSeeCollection(collection, address)
      case CollectionType.THIRD_PARTY: {
        const thirdParty = getThirdPartyForCollection(thirdParties, collection)
        return address && thirdParty && isUserManagerOfThirdParty(address, thirdParty)
      }
      default:
        throw new Error(`Invalid collection type ${type as unknown as string}`)
    }
  })
)

export const getCollection = (state: RootState, collectionId: string) => {
  const collections = getCollections(state)
  return collections.find(collection => collection.id === collectionId) || null
}

export const getCollectionItemCount = (state: RootState, collectionId: string): number => {
  const collections = getData(state)
  return collections[collectionId]?.itemCount || 0
}

export const getCollectionsByContractAddress = createSelector<RootState, ReturnType<typeof getData>, Record<string, Collection>>(
  state => getData(state),
  collectionsById =>
    Object.values(collectionsById).reduce((acc, collection) => {
      const { contractAddress } = collection
      if (contractAddress) {
        acc[contractAddress] = collection
      }
      return acc
    }, {} as Record<string, Collection>)
)

export const isOnSaleLoading = createSelector<RootState, Transaction[], boolean>(getPendingTransactions, transactions =>
  transactions.some(transaction => transaction.actionType === SET_COLLECTION_MINTERS_SUCCESS)
)

export const hasPendingCurationTransaction = createSelector<RootState, Transaction[], boolean>(getPendingTransactions, transactions =>
  transactions.some(transaction => [APPROVE_COLLECTION_SUCCESS, REJECT_COLLECTION_SUCCESS].includes(transaction.actionType))
)

export const getStatusByCollectionId = createSelector<
  RootState,
  Item[],
  Record<string, SyncStatus>,
  Record<string, CollectionCuration>,
  Record<string, SyncStatus>
>(
  state => getItems(state),
  (state: RootState) => getStatusByItemId(state),
  getCurationsByCollectionId,
  (items, itemStatusByItemId, curationsByCollectionId) => {
    const statusByCollectionId: Record<string, SyncStatus> = {}
    for (const item of items) {
      const { collectionId } = item
      // TODO: @TPW item.isPublished is only necessary if we end up using this selector for this feature
      if (collectionId && item.isPublished) {
        if (curationsByCollectionId[collectionId]?.status === 'pending') {
          statusByCollectionId[collectionId] = SyncStatus.UNDER_REVIEW
        } else if (collectionId in statusByCollectionId) {
          statusByCollectionId[collectionId] = getMostRelevantStatus(statusByCollectionId[collectionId], itemStatusByItemId[item.id])
        } else {
          statusByCollectionId[collectionId] = itemStatusByItemId[item.id]
        }
      }
    }
    return statusByCollectionId
  }
)

export const hasViewAndEditRights = (state: RootState, address: string, collection: Collection): boolean => {
  const thirdParty = isThirdParty(collection.urn) ? getCollectionThirdParty(state, collection) : null
  const isTPManager = thirdParty && isUserManagerOfThirdParty(address, thirdParty)
  return isTPManager || canManageCollectionItems(collection, address)
}

/**
 * Returns the corresponding rarities contract depending on if the rarities with oracle
 * feature flag is enabled or not.
 */
export const getRaritiesContract = (chainId: ChainId) => {
  return getContract(ContractName.RaritiesWithOracle, chainId)
}

export const getPublishStatus = (state: RootState) => {
  if (isLoadingType(getLoading(state), PUBLISH_COLLECTION_REQUEST)) {
    return AuthorizationStepStatus.WAITING
  }

  const pendingActionTypeTransactions = getPendingTransactions(state).filter(
    transaction => getType({ type: PUBLISH_COLLECTION_SUCCESS }) === getType({ type: transaction.actionType })
  )

  if (isLoadingType(getLoading(state), CREATE_COLLECTION_FORUM_POST_REQUEST) || pendingActionTypeTransactions.length) {
    return AuthorizationStepStatus.PROCESSING
  }

  if (getError(state)) {
    return AuthorizationStepStatus.ERROR
  }

  return AuthorizationStepStatus.PENDING
}

/**
 * Checks if a specific collection has any items with missing entities
 * @param state - The Redux state
 * @param collectionId - The ID of the collection to check
 * @returns True if the collection has any items with missing entities, false otherwise
 */
export const hasCollectionMissingEntities = (state: RootState, collectionId: string): boolean => {
  const collection = getCollection(state, collectionId)

  // Only consider published and approved collections
  if (!collection || !collection.isPublished || !collection.isApproved) {
    return false
  }

  const items = getCollectionItems(state, collectionId)
  const missingEntities = getMissingEntities(state)

  // Check if any items in this collection have missing entities
  return items.some((item: Item) => item.urn && missingEntities[item.urn])
}
