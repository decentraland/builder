import { createSelector } from 'reselect'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'
import { RootState } from '../../common/types'
import { ItemCurationState } from './reducer'
import { ItemCuration } from './types'

export const getState = (state: RootState) => state.itemCuration
export const getData = (state: RootState) => getState(state).data
export const getLoading = (state: RootState) => getState(state).loading
export const getError = (state: RootState) => getState(state).error
export const getItemCurations = (state: RootState, collectionId: Collection['id']) => getState(state).data[collectionId]

export const getItemCurationsByItemId = createSelector<RootState, ItemCurationState['data'], Record<string, ItemCuration>>(getData, data =>
  Object.values(data).reduce((acc, curr) => {
    curr.forEach(itemCuration => {
      acc[itemCuration.itemId] = itemCuration
    })
    return acc
  }, {} as Record<Item['id'], ItemCuration>)
)
