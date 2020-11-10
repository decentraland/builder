import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { fetchWeeklySceneStatsRequest, FetchWeeklySceneStatsRequestAction, FETCH_WEEKLY_SCENE_STATS_REQUEST } from 'modules/stats/action'
import { getWeeklyStatsByDeploymentId, getLoading } from 'modules/stats/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './SceneStats.types'
import SceneStats from './SceneStats'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => ({
  stats: getWeeklyStatsByDeploymentId(state)[ownProps.deployment.id],
  isLoading: getLoading(state).some(
    action =>
      action.type === FETCH_WEEKLY_SCENE_STATS_REQUEST &&
      (action as FetchWeeklySceneStatsRequestAction).payload.base === ownProps.deployment.base
  )
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onFetchStats: base => dispatch(fetchWeeklySceneStatsRequest(base))
})

export default connect(mapState, mapDispatch)(SceneStats)
