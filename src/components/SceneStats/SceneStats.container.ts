import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { fetchSceneStatsRequest, FetchSceneStatsRequestAction, FETCH_SCENE_STATS_REQUEST } from 'modules/stats/action'
import { getStatsByDeploymentId, getLoading } from 'modules/stats/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './SceneStats.types'
import SceneStats from './SceneStats'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => ({
  stats: getStatsByDeploymentId(state)[ownProps.deployment.id],
  isLoading: getLoading(state).some(
    action =>
      action.type === FETCH_SCENE_STATS_REQUEST && (action as FetchSceneStatsRequestAction).payload.base === ownProps.deployment.base
  )
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onFetchStats: base => dispatch(fetchSceneStatsRequest(base))
})

export default connect(mapState, mapDispatch)(SceneStats)
