import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './LandPage.types'
import { getLands, isLoading } from 'modules/land/selectors'
import { isLoggedIn, isLoggingIn } from 'modules/identity/selectors'
import LandPage from './LandPage'

const mapState = (state: RootState): MapStateProps => ({
  lands: getLands(state),
  isLoading: isLoading(state) || isLoggingIn(state),
  isLoggedIn: isLoggedIn(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path))
})

export default connect(mapState, mapDispatch)(LandPage)
