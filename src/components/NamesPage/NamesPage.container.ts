import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './NamesPage.types'
import { isLoading, getNames } from 'modules/names/selectors'
import NamesPage from './NamesPage'
import { isLoggingIn, isLoggedIn } from 'modules/identity/selectors'

const mapState = (state: RootState): MapStateProps => ({
  names: getNames(state),
  isLoading: isLoading(state) || isLoggingIn(state),
  isLoggedIn: isLoggedIn(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path))
})

export default connect(mapState, mapDispatch)(NamesPage)
