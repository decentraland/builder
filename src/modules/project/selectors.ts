import { createSelector } from 'reselect'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'

import { RootState, Vector3 } from 'modules/common/types'
import { ProjectState } from 'modules/project/reducer'
import { getProjectId } from 'modules/location/utils'
import { getLoading as getAuthLoading, getSub } from 'modules/auth/selectors'
import { AUTH_REQUEST } from 'modules/auth/actions'
import { Project } from 'modules/project/types'
import { PARCEL_SIZE } from './utils'
import { LOAD_PUBLIC_PROJECT_REQUEST } from './actions'

export const getState: (state: RootState) => ProjectState = state => state.project

export const getData: (state: RootState) => ProjectState['data'] = state => getState(state).data

export const getError: (state: RootState) => ProjectState['error'] = state => getState(state).error

export const getLoading = (state: RootState) => getState(state).loading

export const getUserProjects = createSelector(getSub, getData, (userId, projects) => {
  return Object.keys(projects).reduce((record, projectId) => {
    const project = projects[projectId]
    if (project.userId === userId || project.userId === null) {
      record[projectId] = project
    }
    return record
  }, {} as ProjectState['data'])
})

export const getCurrentProject = createSelector<RootState, string | undefined, ProjectState['data'], Project | null>(
  getProjectId,
  getData,
  (projectId, projects) => projects[projectId!] || null
)

export const getCurrentBounds = createSelector<RootState, Project | null, Vector3 | null>(getCurrentProject, project => {
  if (!project) return null
  const { rows, cols } = project.layout
  return {
    x: rows * PARCEL_SIZE,
    y: Math.log2(rows * cols + 1) * 20,
    z: cols * PARCEL_SIZE
  }
})

export const isFetching = createSelector<RootState, LoadingState, LoadingState, boolean>(
  getLoading,
  getAuthLoading,
  (projectLoading, authLoading) => isLoadingType(authLoading, AUTH_REQUEST) || isLoadingType(projectLoading, LOAD_PUBLIC_PROJECT_REQUEST)
)
