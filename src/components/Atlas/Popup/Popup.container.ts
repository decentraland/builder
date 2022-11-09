import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getDeploymentsByLandId } from 'modules/land/selectors'
import { MapStateProps, OwnProps } from './Popup.types'
import Popup from './Popup'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const deploymentsByLandId = getDeploymentsByLandId(state)
  const deployments = deploymentsByLandId[ownProps.land.id] || []
  return {
    deployments
  }
}

export default connect(mapState)(Popup)
