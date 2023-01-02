import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { isLoggedIn, isLoggingIn, getError } from 'modules/identity/selectors'
import { MapStateProps, OwnProps } from './LoggedInDetailPage.types'
import LoggedInDetailPage from './LoggedInDetailPage'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => ({
  isLoggingIn: isLoggingIn(state),
  isLoggedIn: isLoggedIn(state),
  error: getError(state) || ownProps.error
})

const mapDispatch = () => ({})

export default connect(mapState, mapDispatch)(LoggedInDetailPage)
