import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { isConnecting } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { Rental } from 'modules/land/types'
import { getLandId } from 'modules/location/selectors'
import { getLoading, getLands, getDeploymentsByLandId, getRentals } from 'modules/land/selectors'
import { isLoggingIn } from 'modules/identity/selectors'
import { FETCH_LANDS_REQUEST } from 'modules/land/actions'
import { findRental } from 'modules/land/utils'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './LandProvider.types'
import LandProvider from './LandProvider'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const id = ownProps.id || getLandId(state)
  const lands = getLands(state)
  const land = lands.find(land => land.id === id) || null

  const deploymentsByLandId = getDeploymentsByLandId(state)
  const deployments = land && land.id in deploymentsByLandId ? deploymentsByLandId[land.id] : []

  const rentals = getRentals(state)
  let rental: Rental | null = null
  if (land) {
    rental = findRental(land, rentals)
  }

  return {
    id,
    land,
    isLoading: isLoadingType(getLoading(state), FETCH_LANDS_REQUEST) || isLoggingIn(state) || isConnecting(state),
    deployments,
    rental
  }
}

const mapDispatch = (_dispatch: MapDispatch): MapDispatchProps => ({})

export default connect(mapState, mapDispatch)(LandProvider)
