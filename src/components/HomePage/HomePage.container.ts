import { connect } from 'react-redux'
import { isConnecting } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { isLoggedIn, isLoggingIn } from 'modules/identity/selectors'
import { MapStateProps } from './HomePage.types'
import HomePage from './HomePage'

const mapState = (state: RootState): MapStateProps => ({
  isLoggedIn: isLoggedIn(state),
  isLoggingIn: isLoggingIn(state) || isConnecting(state)
})

export default connect(mapState)(HomePage)
