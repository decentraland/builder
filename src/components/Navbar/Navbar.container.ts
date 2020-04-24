import { connect } from 'react-redux'
import { isLoggedIn } from 'modules/identity/selectors'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './Navbar.types'
import Navbar from './Navbar'
import { locations } from 'routing/locations'
import { push } from 'connected-react-router'

const mapState = (state: RootState): MapStateProps => ({
  isConnected: isLoggedIn(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSignIn: () => dispatch(push(locations.signIn()))
})

const mergeProps = (mapStateProps: MapStateProps, mapDispatchProps: MapDispatchProps, ownProps: OwnProps) => ({
  ...mapStateProps,
  ...mapDispatchProps,
  ...ownProps
})

export default connect(mapState, mapDispatch, mergeProps)(Navbar)
