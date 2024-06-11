import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { RootState } from 'modules/common/types'
import { getLandId } from 'modules/location/selectors'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { getParcelsAvailableToBuildEstates, getDeploymentsByCoord, getLandTiles } from 'modules/land/selectors'
import { getENSForLand } from 'modules/ens/selectors'
import { getData as getProjects } from 'modules/project/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './LandDetailPage.types'
import LandDetailPage from './LandDetailPage'

const mapState = (state: RootState): MapStateProps => {
  const landId = getLandId() || ''
  return {
    ensList: getENSForLand(state, landId),
    parcelsAvailableToBuildEstates: getParcelsAvailableToBuildEstates(state),
    deploymentsByCoord: getDeploymentsByCoord(state),
    landTiles: getLandTiles(state),
    projects: getProjects(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata))
})

export default connect(mapState, mapDispatch)(withRouter(LandDetailPage))
