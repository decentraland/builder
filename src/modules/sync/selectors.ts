import { createSelector } from 'reselect'
import { RootState } from 'modules/common/types'
import { getLocalIds, getErrors, getLoadingIds } from './domain/selectors'

export const getState = (state: RootState) => state.sync
export const getProjects = (state: RootState) => getState(state).project
export const getDeployments = (state: RootState) => getState(state).deployment
export const getLocalProjectIds = (state: RootState) => getLocalIds(getProjects(state))
export const getLocalDeploymentIds = (state: RootState) => getLocalIds(getDeployments(state))
export const getProjectErrors = (state: RootState) => getErrors(getProjects(state))
export const getDeploymentErrors = (state: RootState) => getErrors(getDeployments(state))
export const getLoadingProjectIds = (state: RootState) => getLoadingIds(getProjects(state))
export const getLoadingDeploymentIds = (state: RootState) => getLoadingIds(getDeployments(state))

export const getLoadingSet = createSelector<RootState, string[], string[], Set<string>>(
  getLoadingProjectIds,
  getLoadingDeploymentIds,
  (projectIds, deploymentIds) => new Set([...projectIds, ...deploymentIds])
)

export const getFailedProjectIds = createSelector<RootState, Record<string, string>, string[]>(
  getProjectErrors,
  projectErrors => Object.keys(projectErrors)
)

export const getFailedDeploymentIds = createSelector<RootState, Record<string, string>, string[]>(
  getDeploymentErrors,
  deploymentErrors => Object.keys(deploymentErrors)
)

export const getErrorCount = createSelector<RootState, string[], string[], number>(
  getFailedProjectIds,
  getFailedDeploymentIds,
  (failedProjectIds, failedDeploymentIds) => new Set<string>([...failedProjectIds, ...failedDeploymentIds]).size
)
