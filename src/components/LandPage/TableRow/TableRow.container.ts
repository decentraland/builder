import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { RootState } from 'modules/common/types'
import { getDeploymentsByLandId, getRentalForLand } from 'modules/land/selectors'
import { MapStateProps, OwnProps } from './TableRow.types'
import TableRow from './TableRow'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { land } = ownProps

  const deploymentsByLandId = getDeploymentsByLandId(state)
  const deployments = deploymentsByLandId[land.id] || []

  const rental = getRentalForLand(state, land)

  return {
    deployments,
    rental
  }
}

export default connect(mapState)(withRouter(TableRow))
