import { createSelector } from 'reselect'
import { RootState } from 'modules/common/types'
import { ItemState } from './reducer'
import { Item } from './types'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isEqual } from 'lib/address'

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

export const getWalletOrphanItems = createSelector<RootState, Item[], Item[]>(getItems, items =>
  items.filter(item => item.collectionId === undefined)
)
