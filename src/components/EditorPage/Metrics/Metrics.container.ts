import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getCurrentProject } from 'modules/project/selectors'
import { getCurrentMetrics, getCurrentLimits } from 'modules/scene/selectors'
import { MapStateProps } from './Metrics.types'
import Metrics from './Metrics'

const mapState = (state: RootState): MapStateProps => {
  const currentProject = getCurrentProject(state)
  const metrics = getCurrentMetrics(state)
  const limits = getCurrentLimits(state)

  if (currentProject) {
    const { rows, cols } = currentProject.layout
    return {
      rows,
      cols,
      parcels: rows * cols,
      metrics,
      limits
    }
  }
  return {
    rows: 0,
    cols: 0,
    parcels: 0,
    metrics,
    limits
  }
}

export default connect(mapState)(Metrics)
