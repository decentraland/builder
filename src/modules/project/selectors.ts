import { createSelector } from 'reselect'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'

import { isEqual } from 'lib/address'
import { RootState } from 'modules/common/types'
import { ProjectState } from 'modules/project/reducer'
import { getProjectId } from 'modules/location/utils'
import { Project } from 'modules/project/types'
import { Vector3 } from 'modules/models/types'
import { PARCEL_SIZE } from './constants'
import { LOAD_PUBLIC_PROJECT_REQUEST } from './actions'

export const getState: (state: RootState) => ProjectState = state => state.project
export const getData: (state: RootState) => ProjectState['data'] = state => getState(state).data
export const getError: (state: RootState) => ProjectState['error'] = state => getState(state).error
export const getLoading = (state: RootState) => getState(state).loading

export const getUserProjects = createSelector(getAddress, getData, (address, projects) => {
  return Object.keys(projects).reduce((record, projectId) => {
    const project = projects[projectId]
    const isOwnedByUser = !!project.ethAddress && !!address && isEqual(project.ethAddress, address)
    if (isOwnedByUser || project.ethAddress === null) {
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

export const isFetching = createSelector<RootState, LoadingState, boolean>(getLoading, projectLoading =>
  isLoadingType(projectLoading, LOAD_PUBLIC_PROJECT_REQUEST)
)
