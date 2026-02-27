import { createSelector } from 'reselect'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'

import { RootState } from 'modules/common/types'
import { getProjectId } from 'modules/location/utils'
import { getData as gerProjectsData } from 'modules/project/selectors'
import { LOAD_PROJECTS_REQUEST, LOAD_PUBLIC_PROJECT_REQUEST } from 'modules/project/actions'
import { PoolState } from './reducer'
import { LOAD_POOLS_REQUEST } from './actions'
import { RECORDS_PER_PAGE } from './types'

export const getState: (state: RootState) => PoolState = state => state.pool

export const getData: (state: RootState) => PoolState['data'] = state => getState(state).data

export const getError: (state: RootState) => PoolState['error'] = state => getState(state).error

export const getLoading = (state: RootState) => getState(state).loading

export const getTotal = (state: RootState) => getState(state).total

export const getList = (state: RootState) => getState(state).list

export const getTotalPages = createSelector(getTotal, total => {
  switch (total) {
    case null:
    case 0:
      return total
    default:
      return Math.ceil(total / RECORDS_PER_PAGE)
  }
})

export const getPoolList = createSelector(getList, getData, (list, pools) => {
  if (list === null) {
    return null
  }

  return list.map(id => pools[id])
})

export const getCurrentPublicProject = createSelector(getProjectId, gerProjectsData, (projectId, projects) => {
  if (projectId && projects[projectId] && projects[projectId].isPublic) {
    return projects[projectId]
  }

  return null
})

export const getCurrentPool = createSelector(getProjectId, getData, (projectId, pools) => {
  if (projectId && pools[projectId]) {
    return pools[projectId]
  }

  return null
})

export const isFetching = createSelector(
  getLoading,
  projectLoading =>
    isLoadingType(projectLoading, LOAD_PROJECTS_REQUEST) ||
    isLoadingType(projectLoading, LOAD_PUBLIC_PROJECT_REQUEST) ||
    isLoadingType(projectLoading, LOAD_POOLS_REQUEST)
)
