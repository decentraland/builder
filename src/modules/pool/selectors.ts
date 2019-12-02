import { createSelector } from 'reselect'

import { RootState } from 'modules/common/types'
import { getProjectId } from 'modules/location/selectors'
import { getData as gerProjectsData } from 'modules/project/selectors'
import { getLoading as getAuthLoading } from 'modules/auth/selectors'
import { PoolState } from './reducer'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { AUTH_REQUEST } from 'modules/auth/actions'
import { LOAD_PROJECTS_REQUEST, LOAD_PUBLIC_PROJECT_REQUEST } from 'modules/project/actions'
import { LOAD_POOLS_REQUEST } from './actions'

export const getState: (state: RootState) => PoolState = state => state.pool

export const getData: (state: RootState) => PoolState['data'] = state => getState(state).data

export const getError: (state: RootState) => PoolState['error'] = state => getState(state).error

export const getLoading = (state: RootState) => getState(state).loading

export const getCurrentPublicProject = createSelector(
  getProjectId,
  gerProjectsData,
  (projectId, projects) => {
    if (projectId && projects[projectId] && projects[projectId].isPublic) {
      return projects[projectId]
    }

    return null
  }
)

export const getCurrentPool = createSelector(
  getProjectId,
  getData,
  (projectId, pools) => {
    if (projectId && pools[projectId]) {
      return pools[projectId]
    }

    return null
  }
)

export const isFetching = createSelector(
  getLoading,
  getAuthLoading,
  (projectLoading, authLoading) =>
    isLoadingType(authLoading, AUTH_REQUEST) ||
    isLoadingType(projectLoading, LOAD_PROJECTS_REQUEST) ||
    isLoadingType(projectLoading, LOAD_PUBLIC_PROJECT_REQUEST) ||
    isLoadingType(projectLoading, LOAD_POOLS_REQUEST)
)
