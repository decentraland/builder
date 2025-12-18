import { connect } from 'react-redux'
import { Location } from 'history'
import { locationChange } from 'modules/location/actions'
import { AppRoutes } from './AppRoutes'
import { MapDispatch, MapDispatchProps } from './AppRoutes.types'

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onLocationChange: (location: Location) => dispatch(locationChange(location))
})

export default connect(undefined, mapDispatch)(AppRoutes)
