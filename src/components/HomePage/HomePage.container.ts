import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { isConnecting } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { isLoggedIn, isLoggingIn } from 'modules/identity/selectors'
import { hasHistory } from 'modules/location/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './HomePage.types'
import HomePage from './HomePage'

const mapState = (state: RootState): MapStateProps => ({
  isLoggedIn: isLoggedIn(state),
  isLoggingIn: isLoggingIn(state) || isConnecting(state),
  hasRouterHistory: hasHistory(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path))
})

export default connect(mapState, mapDispatch)(HomePage)
