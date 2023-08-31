import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { isPending } from 'decentraland-dapps/dist/modules/transaction/utils'
import { isConnected, isConnecting } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from '../../modules/common/types'
import { getTransactions } from '../../modules/transaction/selectors'
import { locations } from '../../routing/locations'
import { MapStateProps, MapDispatch, MapDispatchProps } from './UserInformation.types'
import UserMenu from './UserInformation'
import { logout } from '../../modules/identity/actions'

const mapState = (state: RootState): MapStateProps => {
  return {
    isSignedIn: isConnected(state),
    isSigningIn: isConnecting(state),
    hasActivity: getTransactions(state).some(tx => isPending(tx.status))
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onClickActivity: () => dispatch(push(locations.activity())),
  onClickSettings: () => dispatch(push(locations.settings())),
  onSignOut: () => dispatch(logout())
})

export default connect(mapState, mapDispatch)(UserMenu)
