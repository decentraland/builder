import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { findRental } from 'modules/land/utils'
import { RootState } from 'modules/common/types'
import { getDeploymentsByLandId, getRentals } from 'modules/land/selectors'
import { MapDispatch, MapDispatchProps, MapStateProps, OwnProps } from './TableRow.types'
import TableRow from './TableRow'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { land } = ownProps

  const deploymentsByLandId = getDeploymentsByLandId(state)
  const deployments = deploymentsByLandId[land.id] || []

  const rentals = getRentals(state)
  const rental = findRental(land, rentals)

  return {
    deployments,
    rental
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path))
})

export default connect(mapState, mapDispatch)(TableRow)
