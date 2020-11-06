import { Dispatch } from 'redux'
import { Deployment } from 'modules/deployment/types'
import { fetchSceneStatsRequest, FetchSceneStatsRequestAction } from 'modules/stats/action'
import { WeeklyStats } from 'modules/stats/types'

export type Props = {
  deployment: Deployment
  stats: WeeklyStats | null
  isLoading: boolean
  onFetchStats: typeof fetchSceneStatsRequest
}

export type MapStateProps = Pick<Props, 'stats' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onFetchStats'>
export type MapDispatch = Dispatch<FetchSceneStatsRequestAction>
export type OwnProps = Pick<Props, 'deployment'>
