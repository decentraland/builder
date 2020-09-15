import { createSelector } from 'reselect'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { getItems } from 'modules/item/selectors'
import { isEqual } from 'lib/address'
import { Collection } from './types'
import { CollectionState } from './reducer'

export const getState = (state: RootState) => state.collection
export const getData = (state: RootState) => getState(state).data
export const getLoading = (state: RootState) => getState(state).loading
export const getError = (state: RootState) => getState(state).error

export const getCollections = createSelector<RootState, CollectionState['data'], string | undefined, Collection[]>(
  getData,
  getAddress,
  (collectionData, address) => Object.values(collectionData).filter(collection => address && isEqual(collection.owner, address))
)

export const getCollection = (state: RootState, collectionId: string) => {
  const collections = getCollections(state)
  return collections.find(collection => collection.id === collectionId) || null
}

export const getCollectionItems = (state: RootState, collectionId: string) => {
  const collection = getCollection(state, collectionId)
  if (!collection) {
    return []
  }

  const allItems = getItems(state)
  return allItems.filter(item => item.collectionId === collectionId)
}
