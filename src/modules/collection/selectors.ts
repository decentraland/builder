import { RootState } from 'modules/common/types'
import { createSelector } from 'reselect'
import { isEqual } from 'lib/address'
import { Collection } from './types'
import { CollectionState } from './reducer'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'

export const getState = (state: RootState) => state.collection
export const getData = (state: RootState) => getState(state).data
export const getLoading = (state: RootState) => getState(state).loading
export const getError = (state: RootState) => getState(state).error
export const getCollections = createSelector<RootState, CollectionState['data'], string | undefined, Collection[]>(
  getData,
  getAddress,
  (collectionData, address) => Object.values(collectionData).filter(collection => address && isEqual(collection.owner, address))
)
