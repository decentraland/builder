import { createSelector } from 'reselect'
import { Entity } from 'dcl-catalyst-commons'
import { RootState } from 'modules/common/types'
import { EntityState } from './reducer'

export const getState = (state: RootState) => state.entity
export const getData = (state: RootState) => getState(state).data
export const getError = (state: RootState) => getState(state).error
export const getLoading = (state: RootState) => getState(state).loading
export const getEntities = createSelector<RootState, EntityState['data'], Entity[]>(getData, entityData => Object.values(entityData))
