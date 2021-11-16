import { createSelector } from 'reselect'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { Transaction } from 'decentraland-dapps/dist/modules/transaction/types'
import { RootState } from 'modules/common/types'
import { getPendingTransactions } from 'modules/transaction/selectors'
import { getItems, getStatusByItemId } from 'modules/item/selectors'
import { Item, SyncStatus } from 'modules/item/types'
import { getCurationsByCollectionId } from 'modules/curation/selectors'
import { getData as getThirdParties } from 'modules/thirdParty/selectors'
import { getThirdPartyOfCollection, isUserManagerOfThirdParty } from 'modules/thirdParty/utils'
import { ThirdParty } from 'modules/thirdParty/types'
import { Curation } from 'modules/curation/types'
import { isEqual } from 'lib/address'
import { decodeURN, URNType } from 'lib/urn'
import { SET_COLLECTION_MINTERS_SUCCESS, APPROVE_COLLECTION_SUCCESS, REJECT_COLLECTION_SUCCESS } from './actions'
import { Collection } from './types'
import { CollectionState } from './reducer'
import { canSeeCollection, getMostRelevantStatus } from './utils'

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
    if (decodeURN(collection.urn).type === URNType.COLLECTIONS_THIRDPARTY) {
      const thirdParty = getThirdPartyOfCollection(thirdParties, collection)
      return address && thirdParty && isUserManagerOfThirdParty(address, thirdParty)
    } else {
      return address && canSeeCollection(collection, address)
    }
  })
)

export const getCollection = (state: RootState, collectionId: string) => {
  const collections = getCollections(state)
  return collections.find(collection => collection.id === collectionId) || null
}

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
  Record<string, Curation>,
  Record<string, SyncStatus>
>(
  state => getItems(state),
  state => getStatusByItemId(state),
  state => getCurationsByCollectionId(state),
  (items, itemStatusByItemId, curationsByCollectionId) => {
    const statusByCollectionId: Record<string, SyncStatus> = {}
    for (const item of items) {
      const { collectionId } = item
      if (collectionId) {
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
