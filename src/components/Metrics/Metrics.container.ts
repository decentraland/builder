import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getCurrentProject } from 'modules/project/selectors'
import { EMPTY_SCENE_METRICS } from 'modules/scene/constants'
import { getCurrentScene } from 'modules/scene/selectors'
import { MapDispatch, MapDispatchProps, MapStateProps } from './Metrics.types'
import Metrics from './Metrics'

const mapState = (state: RootState): MapStateProps => {
  const currentProject = getCurrentProject(state)
  const currentScene = getCurrentScene(state)
  if (currentProject && currentScene) {
    const { rows, cols } = currentProject.parcelLayout
    return {
      rows,
      cols,
      parcels: rows * cols,
      metrics: currentScene.metrics,
      limits: currentScene.limits
    }
  }
  return {
    rows: 0,
    cols: 0,
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
