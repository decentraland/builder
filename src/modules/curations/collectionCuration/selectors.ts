import { createSelector } from 'reselect'
import { RootState } from '../../common/types'
import { CollectionCurationState } from './reducer'
import { CollectionCuration } from './types'

export const getState = (state: RootState) => state.collectionCuration
export const getCurationsByCollectionId = (state: RootState) => getState(state).data
export const getLoading = (state: RootState) => getState(state).loading
export const getError = (state: RootState) => getState(state).error
export const getCuration = (state: RootState, collectionId: string) => getCurationsByCollectionId(state)[collectionId]

export const getCurations = createSelector<RootState, CollectionCurationState['data'], CollectionCuration[]>(
  getCurationsByCollectionId,
  data => Object.values(data)
)

export const getHasPendingCollectionCuration = (state: RootState, collectionId: string) =>
  getCurationsByCollectionId(state)[collectionId]?.status === 'pending'
