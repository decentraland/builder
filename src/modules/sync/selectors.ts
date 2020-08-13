import { createSelector } from 'reselect'
import { RootState } from 'modules/common/types'
import { getLocalIds, getErrors, getLoadingIds } from './domain/selectors'
import { getCurrentProject, getUserProjects } from 'modules/project/selectors'
import { Project } from 'modules/project/types'
import { ProjectState } from 'modules/project/reducer'

export const getState = (state: RootState) => state.sync
export const getProjects = (state: RootState) => getState(state).project
export const getLocalProjectIds = (state: RootState) => getLocalIds(getProjects(state))
export const getProjectErrors = (state: RootState) => getErrors(getProjects(state))
export const getLoadingProjectIds = (state: RootState) => getLoadingIds(getProjects(state))

export const getLoadingSet = createSelector<RootState, string[], ProjectState['data'], Set<string>>(
  getLoadingProjectIds,
  getUserProjects,
  (projectIds, projects) => new Set([...projectIds].filter(id => id in projects))
)

export const isSavingCurrentProject = createSelector<RootState, Project | null, Set<string>, boolean>(
  getCurrentProject,
  getLoadingSet,
  (currentProject, loadingSet) => {
    if (!currentProject) return false
    return loadingSet.has(currentProject.id)
  }
)

export const getFailedProjectIds = createSelector<RootState, Record<string, string>, string[]>(getProjectErrors, projectErrors =>
  Object.keys(projectErrors)
)

export const getErrorSet = createSelector<RootState, string[], ProjectState['data'], Set<string>>(
  getFailedProjectIds,
  getUserProjects,
  (failedProjectIds, projects) => new Set<string>([...failedProjectIds].filter(id => id in projects))
)
