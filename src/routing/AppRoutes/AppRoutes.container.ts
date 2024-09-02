import { connect } from 'react-redux'
import { saveLastLocation } from 'modules/ui/location/action'
import { AppRoutes } from './AppRoutes'
import { MapDispatch, MapDispatchProps } from './AppRoutes.types'

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  saveLastLocation: (location: string) => dispatch(saveLastLocation(location))
})

export default connect(undefined, mapDispatch)(AppRoutes)
