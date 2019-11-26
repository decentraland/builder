import { RootState } from "modules/common/types"
import { PoolGroupState } from "./reducer"

export const getState: (state: RootState) => PoolGroupState = state => state.poolGroup

export const getData: (state: RootState) => PoolGroupState['data'] = state => getState(state).data

export const getError: (state: RootState) => PoolGroupState['error'] = state => getState(state).error

export const getLoading = (state: RootState) => getState(state).loading

export const getCurrentActive = (state: RootState) => {
  const poolGroups = getData(state)
  return Object.values(poolGroups).filter(poolGroup => poolGroup.isActive)
}
