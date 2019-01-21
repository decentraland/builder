import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getCurrentProject } from 'modules/project/selectors'
import { EMPTY_SCENE_METRICS } from 'modules/scene/constants'
import { MapDispatch, MapDispatchProps, MapStateProps } from './Metrics.types'
import Metrics from './Metrics'
import { getCurrentScene } from 'modules/scene/selectors'

const mapState = (state: RootState): MapStateProps => {
  const currentProject = getCurrentProject(state)
  const currentScene = getCurrentScene(state)
  if (currentProject && currentScene) {
    return {
      parcels: currentProject.parcels.length,
      metrics: currentScene.metrics,
      limits: currentScene.limits
    }
  }
  return {
    parcels: 0,
    metrics: EMPTY_SCENE_METRICS,
    limits: EMPTY_SCENE_METRICS
  }
}

const mapDispatch = (_: MapDispatch): MapDispatchProps => ({})

export default connect(
  mapState,
  mapDispatch
)(Metrics)
