import { createSelector } from 'reselect'
import { RootState } from 'modules/common/types'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isEqual } from 'lib/address'
import { Collection } from 'modules/collection/types'
import { getAuthorizedCollections } from 'modules/collection/selectors'
import { ItemState } from './reducer'
import { Item, Rarity } from './types'
import { canSeeItem } from './utils'

export const getState = (state: RootState) => state.item
export const getData = (state: RootState) => getState(state).data
export const getLoading = (state: RootState) => getState(state).loading
export const getError = (state: RootState) => getState(state).error

export const getItems = createSelector<RootState, ItemState['data'], Item[]>(getData, itemData => Object.values(itemData))

export const getItem = (state: RootState, itemId: string) => {
  const items = getItems(state)
  return items.find(item => item.id === itemId) || null
}

export const getWalletItems = createSelector<RootState, Item[], string | undefined, Item[]>(getItems, getAddress, (items, address) =>
  items.filter(item => address && isEqual(item.owner, address))
)

export const getAuthorizedItems = createSelector<RootState, Collection[], Item[], string | undefined, Item[]>(
  getAuthorizedCollections,
  getItems,
  getAddress,
  (collections, items, address) => {
    if (!address) {
      return []
    }

    return items.filter(item => {
      const collection = collections.filter(collection => collection.id === item.collectionId)[0]
      return canSeeItem(collection, item, address)
    })
  }
)

export const getWalletOrphanItems = createSelector<RootState, Item[], Item[]>(getAuthorizedItems, items =>
  items.filter(item => item.collectionId === undefined)
)

export const getRarities = (state: RootState): Rarity[] => {
  return getState(state).rarities
}
