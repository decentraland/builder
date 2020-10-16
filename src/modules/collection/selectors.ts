import { createSelector } from 'reselect'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { getPendingTransactions } from 'decentraland-dapps/dist/modules/transaction/selectors'
import { isPending } from 'decentraland-dapps/dist/modules/transaction/utils'

import { RootState } from 'modules/common/types'
import { getItems } from 'modules/item/selectors'
import { isEqual } from 'lib/address'
import { SET_COLLECTION_MINTERS_SUCCESS } from './actions'
import { Collection } from './types'
import { CollectionState } from './reducer'

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

export const getCollection = (state: RootState, collectionId: string) => {
  const collections = getCollections(state)
  return collections.find(collection => collection.id === collectionId) || null
}

export const getCollectionItems = (state: RootState, collectionId: string) => {
  const allItems = getItems(state)
  return allItems.filter(item => item.collectionId === collectionId)
}

export const isOnSaleLoading = (state: RootState, address?: string) =>
  address
    ? getPendingTransactions(state, address).some(
        transaction => transaction.actionType === SET_COLLECTION_MINTERS_SUCCESS && isPending(transaction.status)
      )
    : false
