import { createSelector } from 'reselect'
import { RootState } from 'modules/common/types'
import { getData as getDeployments } from 'modules/deployment/selectors'
import { DeploymentState } from 'modules/deployment/reducer'
import { StatsState } from './reducer'
import { WeeklyStats } from './types'

export const getState = (state: RootState) => state.stats
export const getData = (state: RootState) => getState(state).data
export const getLoading = (state: RootState) => getState(state).loading
export const getError = (state: RootState) => getState(state).error
export const getWeeklyStatsByDeploymentId = createSelector<
  RootState,
  DeploymentState['data'],
  StatsState['data'],
  Record<string, WeeklyStats | null>
>(getDeployments, getData, (deployments, data) =>
  Object.values(deployments).reduce((obj, deployment) => {
    obj[deployment.id] = deployment.base in data.weekly ? data.weekly[deployment.base] : null
    return obj
  }, {} as Record<string, WeeklyStats | null>)
)
