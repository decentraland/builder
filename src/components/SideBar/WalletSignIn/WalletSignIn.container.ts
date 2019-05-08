import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { connectWalletRequest } from 'decentraland-dapps/dist/modules/wallet/actions'
import { getError as getWalletError, isConnecting } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './WalletSignIn.types'
import WalletSignIn from './WalletSignIn'

const mapState = (state: RootState): MapStateProps => ({
  isConnecting: isConnecting(state),
  hasError: !!getWalletError(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onConnect: () => dispatch(connectWalletRequest())
})

export default connect(
  mapState,
  mapDispatch
)(WalletSignIn)
