import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { connectWalletRequest } from 'decentraland-dapps/dist/modules/wallet/actions'
import { getError as getWalletError, isConnecting, isConnected } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './DeployToLand.types'
import { isRecording, isUploadingAssets, getLocalCID } from 'modules/deployment/selectors'
import { getMediaByCID } from 'modules/media/selectors'
import WalletSignIn from './DeployToLand'

const mapState = (state: RootState): MapStateProps => {
  const cid = getLocalCID(state)

  return {
    isConnecting: isConnecting(state),
    isConnected: isConnected(state),
    isRecording: isRecording(state),
    isUploadingAssets: isUploadingAssets(state),
    hasError: !!getWalletError(state),
    media: getMediaByCID(cid)(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onConnect: () => dispatch(connectWalletRequest())
})

export default connect(
  mapState,
  mapDispatch
)(WalletSignIn)
