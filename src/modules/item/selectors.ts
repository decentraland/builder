import { createSelector } from 'reselect'
import { RootState } from 'modules/common/types'
import { ItemState } from './reducer'
import { Item } from './types'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isEqual } from 'lib/address'
import { canSeeItem } from './utils'
import { Collection } from 'modules/collection/types'
import { getAuthorizedCollections } from 'modules/collection/selectors'

export const getState = (state: RootState) => state.item
export const getData = (state: RootState) => getState(state).data
export const getLoading = (state: RootState) => getState(state).loading
export const getError = (state: RootState) => getState(state).error

export const getItems = createSelector<RootState, ItemState['data'], string | undefined, Item[]>(getData, getAddress, itemData =>
  Object.values(itemData)
)

export const getWalletItems = createSelector<RootState, Item[], string | undefined, Item[]>(getItems, getAddress, (items, address) =>
  items.filter(item => address && isEqual(item.owner, address))
)

export const getAuthorizedItems = createSelector<RootState, Collection[], Item[], string | undefined, Item[]>(
  getAuthorizedCollections,
  getItems,
  getAddress,
  (collections, items, address) =>
    items.filter(item => {
      const collection = collections.filter(collection => collection.id === item.collectionId)[0]
      return address && collection && canSeeItem(collection, item, address)
    })
)

export const getWalletOrphanItems = createSelector<RootState, Item[], Item[]>(getItems, items =>
  items.filter(item => item.collectionId === undefined)
)
