import { createSelector } from 'reselect'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { Transaction } from 'decentraland-dapps/dist/modules/transaction/types'
import { RootState } from 'modules/common/types'
import { getPendingTransactions } from 'modules/transaction/selectors'
import { getItems, getStatusByItemId } from 'modules/item/selectors'
import { Item, SyncStatus } from 'modules/item/types'
import { getCurationsByCollectionId } from 'modules/curations/collectionCuration/selectors'
import { CollectionCuration } from 'modules/curations/collectionCuration/types'
import { getCollectionThirdParty, getData as getThirdParties } from 'modules/thirdParty/selectors'
import { getThirdPartyForCollection, isUserManagerOfThirdParty } from 'modules/thirdParty/utils'
import { ThirdParty } from 'modules/thirdParty/types'
import { isEqual } from 'lib/address'
import { isThirdParty } from 'lib/urn'
import { SET_COLLECTION_MINTERS_SUCCESS, APPROVE_COLLECTION_SUCCESS, REJECT_COLLECTION_SUCCESS } from './actions'
import { Collection, CollectionType } from './types'
import { CollectionState } from './reducer'
import { canSeeCollection, getCollectionType, getMostRelevantStatus, isOwner } from './utils'

export const getState = (state: RootState) => state.collection
export const getData = (state: RootState) => getState(state).data
export const getLoading = (state: RootState) => getState(state).loading
export const getError = (state: RootState) => getState(state).error

export const getCollections = createSelector<RootState, CollectionState['data'], string | undefined, Collection[]>(
  getData,
  getAddress,
  collectionData => Object.values(collectionData)
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
      case CollectionType.DECENTRALAND:
        return address && canSeeCollection(collection, address)
      case CollectionType.THIRD_PARTY:
        const thirdParty = getThirdPartyForCollection(thirdParties, collection)
        return address && thirdParty && isUserManagerOfThirdParty(address, thirdParty)
      default:
        throw new Error(`Invalid collection type ${type}`)
    }
  })
)

export const getCollection = (state: RootState, collectionId: string) => {
  const collections = getCollections(state)
  return collections.find(collection => collection.id === collectionId) || null
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
  Collection['id'],
  Item[],
  Collection['id'],
  Record<string, SyncStatus>,
  Record<string, CollectionCuration>,
  SyncStatus
>(
  state => getItems(state),
  (_: RootState, collectionId: Collection['id']) => collectionId,
  (state: RootState, collectionId: Collection['id']) => getStatusByItemId(state, collectionId),
  getCurationsByCollectionId,
  (items, collectionId, itemStatusByItemId, curationsByCollectionId) => {
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
    return statusByCollectionId[collectionId]
  }
)

export const isThirdPartyCollection = createSelector<
  RootState,
  Collection['id'] | undefined,
  CollectionState['data'],
  Collection['id'] | undefined,
  boolean
>(
  getData,
  (_: RootState, collectionId?: string) => collectionId,
  (data, collectionId?: Collection['id']) => !!collectionId && !!isThirdParty(data[collectionId]?.urn)
)

export const hasViewAndEditRights = (state: RootState, address: string, collection: Collection): boolean => {
  const thirdParty = isThirdParty(collection.urn) ? getCollectionThirdParty(state, collection) : null
  const isTPManager = thirdParty && isUserManagerOfThirdParty(address, thirdParty)
  return isTPManager || isOwner(collection, address)
}
