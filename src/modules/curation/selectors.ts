import { createSelector } from 'reselect'
import { RootState } from '../common/types'
import { CurationState } from './reducer'
import { Curation } from './types'

export const getState = (state: RootState) => state.curation
export const getCurationsByCollectionId = (state: RootState) => getState(state).data
export const getLoading = (state: RootState) => getState(state).loading
export const getError = (state: RootState) => getState(state).error
export const getCuration = (state: RootState, collectionId: string) => getCurationsByCollectionId(state)[collectionId]

export const getCurations = createSelector<RootState, CurationState['data'], Curation[]>(getCurationsByCollectionId, data =>
  Object.values(data)
)

export const getHasPendingCuration = (state: RootState, collectionId: string) =>
  getCurationsByCollectionId(state)[collectionId]?.status === 'pending'
