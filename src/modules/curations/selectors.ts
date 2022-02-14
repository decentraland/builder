import { isThirdPartyCollection } from 'modules/collection/selectors'
import { Collection } from 'modules/collection/types'
import { RootState } from 'modules/common/types'
import { createSelector } from 'reselect'
import { getCurationsByCollectionId } from './collectionCuration/selectors'
import { CollectionCuration } from './collectionCuration/types'
import { getItemCurationsByCollectionId } from './itemCuration/selectors'
import { ItemCuration } from './itemCuration/types'
import { CurationStatus } from './types'

export const getHasPendingCuration = createSelector<
  RootState,
  Collection['id'],
  boolean,
  Record<string, CollectionCuration>,
  Collection['id'],
  ItemCuration[],
  boolean
>(
  (state, collectionId) => isThirdPartyCollection(state, collectionId),
  state => getCurationsByCollectionId(state),
  (_: RootState, collectionId) => collectionId,
  (state, collectionId) => getItemCurationsByCollectionId(state, collectionId),
  (isTPW, collectionCurations, collectionId, itemCurations) => {
    const isCollectionInPending = collectionCurations[collectionId]?.status === 'pending'
    const areAnyPendingItems = itemCurations.some(itemCuration => itemCuration.status === CurationStatus.PENDING)
    return isTPW ? isCollectionInPending && areAnyPendingItems : isCollectionInPending
  }
)
