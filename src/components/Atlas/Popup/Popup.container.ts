import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getDeploymentsByLandId } from 'modules/land/selectors'
import { MapDispatch, MapDispatchProps, MapStateProps, OwnProps } from './Popup.types'
import Popup from './Popup'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const deploymentsByLandId = getDeploymentsByLandId(state)
  const deployments = deploymentsByLandId[ownProps.land.id] || []
  return {
    deployments
  }
}

const mapDispatch = (_dispatch: MapDispatch): MapDispatchProps => ({})

export default connect(mapState, mapDispatch)(Popup)
