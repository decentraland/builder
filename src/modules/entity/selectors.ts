import { createSelector } from 'reselect'
import { Entity } from '@dcl/schemas'
import { RootState } from 'modules/common/types'
import { EntityState } from './reducer'

export const getState = (state: RootState) => state.entity
export const getData = createSelector<RootState, EntityState, EntityState['data']>(getState, state => state.data)
export const getError = createSelector<RootState, EntityState, EntityState['error']>(getState, state => state.error)
export const getLoading = createSelector<RootState, EntityState, EntityState['loading']>(getState, state => state.loading)
export const getEntities = createSelector<RootState, EntityState['data'], Entity[]>(getData, entityData => Object.values(entityData))

export const getMissingEntities = createSelector<RootState, EntityState, EntityState['missingEntities']>(
  getState,
  state => state.missingEntities
)
