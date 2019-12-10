import { RootState } from 'modules/common/types'
import { PoolGroupState } from './reducer'
import { PoolGroup } from './types'

export const getState: (state: RootState) => PoolGroupState = state => state.poolGroup

export const getData: (state: RootState) => PoolGroupState['data'] = state => getState(state).data

export const getError: (state: RootState) => PoolGroupState['error'] = state => getState(state).error

export const getLoading = (state: RootState) => getState(state).loading

export const getAllPoolGroups = (state: RootState) => {
  const poolGroups = getData(state)
  return Object.values(poolGroups)
}

export const getActivePoolGroup = (state: RootState) => {
  const poolGroups = getData(state)
  return Object.values(poolGroups).reduce<PoolGroup | null>((current, poolGroup) => {
    if (poolGroup.isActive) {
      if (!current || current.activeFrom.getTime() > poolGroup.activeFrom.getTime()) {
        return poolGroup
      }
    }

    return current
  }, null)
}
