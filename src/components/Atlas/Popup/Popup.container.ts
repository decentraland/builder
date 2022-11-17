import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getDeploymentsByLandId, getRentals } from 'modules/land/selectors'
import { MapStateProps, OwnProps } from './Popup.types'
import Popup from './Popup'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const deploymentsByLandId = getDeploymentsByLandId(state)
  const deployments = deploymentsByLandId[ownProps.land.id] || []
  return {
    deployments,
    rentals: getRentals(state)
  }
}

export default connect(mapState)(Popup)
