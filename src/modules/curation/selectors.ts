import { createSelector } from 'reselect'
import { getData as getCollectionsById } from 'modules/collection/selectors'
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

/**
 * Filters from curations, all curations which collection has already been reviewed by a curator.
 */
export const getValidCurations = createSelector<
  RootState,
  ReturnType<typeof getCollectionsById>,
  ReturnType<typeof getCurationsByCollectionId>,
  CurationState['data']
>(getCollectionsById, getCurationsByCollectionId, (collections, curations) =>
  Object.keys(curations)
    .filter(collectionId => collections[collectionId].reviewedAt < curations[collectionId].timestamp)
    .reduce((acc, collectionId) => ({ ...acc, [collectionId]: curations[collectionId] }), {})
)

export const getIsValidCuration = (state: RootState, collectionId: string) => !!getValidCurations(state)[collectionId]
