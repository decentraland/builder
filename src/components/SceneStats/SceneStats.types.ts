import { Dispatch } from 'redux'
import { Deployment } from 'modules/deployment/types'
import { fetchWeeklySceneStatsRequest, FetchWeeklySceneStatsRequestAction } from 'modules/stats/action'
import { WeeklyStats } from 'modules/stats/types'

export type Props = {
  deployment: Deployment
  stats: WeeklyStats | null
  isLoading: boolean
  onFetchStats: typeof fetchWeeklySceneStatsRequest
}

export type MapStateProps = Pick<Props, 'stats' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onFetchStats'>
export type MapDispatch = Dispatch<FetchWeeklySceneStatsRequestAction>
export type OwnProps = Pick<Props, 'deployment'>
