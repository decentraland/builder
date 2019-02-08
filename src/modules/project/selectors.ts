import { createSelector } from 'reselect'

import { RootState, Vector3 } from 'modules/common/types'
import { ProjectState } from 'modules/project/reducer'
import { getProjectId } from 'modules/location/selectors'
import { Project } from 'modules/project/types'
import { PARCEL_SIZE } from './utils'

export const getState: (state: RootState) => ProjectState = state => state.project

export const getData: (state: RootState) => ProjectState['data'] = state => getState(state).data

export const isLoading: (state: RootState) => boolean = state => getState(state).loading.length > 0

export const getError: (state: RootState) => ProjectState['error'] = state => getState(state).error

export const getCurrentProject = createSelector<RootState, string | undefined, ProjectState['data'], Project | null>(
  getProjectId,
  getData,
  (projectId, projects) => (projectId && projectId in projects ? projects[projectId] : null)
)

export const getProjectLayout = createSelector<RootState, Project | null, Project['parcelLayout'] | null>(
  getCurrentProject,
  project => (project ? project.parcelLayout : null)
)

export const getProjectBounds = createSelector<RootState, Project | null, Vector3 | null>(
  getCurrentProject,
  project => {
    if (!project) return null
    const { cols, rows } = project.parcelLayout
    return { x: rows * PARCEL_SIZE, y: Math.log2(cols * rows + 1) * 20, z: cols * PARCEL_SIZE }
  }
)
