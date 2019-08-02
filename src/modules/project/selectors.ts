import { createSelector } from 'reselect'

import { RootState, Vector3 } from 'modules/common/types'
import { ProjectState } from 'modules/project/reducer'
import { getProjectId } from 'modules/location/selectors'
import { Project } from 'modules/project/types'
import { PARCEL_SIZE } from './utils'

export const getState: (state: RootState) => ProjectState = state => state.project

export const getData: (state: RootState) => ProjectState['data'] = state => getState(state).data

export const getError: (state: RootState) => ProjectState['error'] = state => getState(state).error

export const getCurrentProject = createSelector<RootState, string | undefined, ProjectState['data'], Project | null>(
  getProjectId,
  getData,
  (projectId, projects) => projects[projectId!] || null
)

export const getCurrentBounds = createSelector<RootState, Project | null, Vector3 | null>(
  getCurrentProject,
  project => {
    if (!project) return null
    const { rows, cols } = project
    return {
      x: rows * PARCEL_SIZE,
      y: Math.log2(rows * cols + 1) * 20,
      z: cols * PARCEL_SIZE
    }
  }
)
