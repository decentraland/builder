import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { isLoggedIn, isLoggingIn } from 'modules/identity/selectors'
import { MapStateProps } from './LoggedInDetailPage.types'
import LoggedInDetailPage from './LoggedInDetailPage'

const mapState = (state: RootState): MapStateProps => ({
  isLoggingIn: isLoggingIn(state),
  isLoggedIn: isLoggedIn(state)
})

const mapDispatch = () => ({})

export default connect(mapState, mapDispatch)(LoggedInDetailPage)
