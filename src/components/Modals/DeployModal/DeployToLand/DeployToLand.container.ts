import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { connectWalletRequest } from 'decentraland-dapps/dist/modules/wallet/actions'
import { getError as getWalletError, isConnecting, isConnected } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isUploadingAssets } from 'modules/deployment/selectors'
import { getMedia, isRecording } from 'modules/media/selectors'

import { MapStateProps, MapDispatchProps, MapDispatch } from './DeployToLand.types'
import WalletSignIn from './DeployToLand'
import { deployToLandRequest } from 'modules/deployment/actions'
import { recordMediaRequest } from 'modules/media/actions'

const mapState = (state: RootState): MapStateProps => {
  return {
    isConnecting: isConnecting(state),
    isConnected: isConnected(state),
    isRecording: isRecording(state),
    isUploadingAssets: isUploadingAssets(state),
    hasError: !!getWalletError(state),
    media: getMedia(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onConnect: () => dispatch(connectWalletRequest()),
  onRecord: () => dispatch(recordMediaRequest(null)),
  onDeploy: () => dispatch(deployToLandRequest((window as any)['ethereum'].selectedAddress, { x: -149, y: -28 }, 'east'))
})

export default connect(
  mapState,
  mapDispatch
)(WalletSignIn)
