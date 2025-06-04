import { createSelector } from 'reselect'
import { Entity } from '@dcl/schemas'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { FETCH_ENTITIES_BY_POINTERS_REQUEST, FETCH_ENTITIES_BY_IDS_REQUEST } from './actions'
import { EntityState } from './reducer'

export const getState = (state: RootState) => state.entity
export const getData = (state: RootState) => getState(state).data
export const getError = (state: RootState) => getState(state).error
export const getLoading = (state: RootState) => getState(state).loading
export const getEntities = createSelector<RootState, EntityState['data'], Entity[]>(getData, entityData => Object.values(entityData))
export const isFetchingEntities = createSelector([getLoading], loading => {
  return loading.some(
    _action => isLoadingType(loading, FETCH_ENTITIES_BY_POINTERS_REQUEST) || isLoadingType(loading, FETCH_ENTITIES_BY_IDS_REQUEST)
  )
})
