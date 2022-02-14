import { Collection } from 'modules/collection/types'
import { RootState } from '../common/types'

export const getState = (state: RootState) => state.itemCuration
export const getLoading = (state: RootState) => getState(state).loading
export const getError = (state: RootState) => getState(state).error
export const getItemCurationsByCollectionId = (state: RootState, collectionId: Collection['id']) => getState(state).data[collectionId]
