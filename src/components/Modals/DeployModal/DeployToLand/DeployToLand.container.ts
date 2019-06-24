import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { connectWalletRequest } from 'decentraland-dapps/dist/modules/wallet/actions'
import { getError as getWalletError, isConnecting, isConnected, getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isUploadingAssets } from 'modules/deployment/selectors'
import { getMedia, isRecording, getProgress } from 'modules/media/selectors'

import { MapStateProps, MapDispatchProps, MapDispatch } from './DeployToLand.types'
import WalletSignIn from './DeployToLand'
import { deployToLandRequest } from 'modules/deployment/actions'
import { recordMediaRequest } from 'modules/media/actions'
import { getCurrentProject } from 'modules/project/selectors'

const mapState = (state: RootState): MapStateProps => {
  return {
    project: getCurrentProject(state),
    isConnecting: isConnecting(state),
    isConnected: isConnected(state),
    isRecording: isRecording(state),
    isUploadingAssets: isUploadingAssets(state),
    hasError: !!getWalletError(state),
    media: getMedia(state),
    ethAddress: getAddress(state),
    mediaProgress: getProgress(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onConnect: () => dispatch(connectWalletRequest()),
  onRecord: () => dispatch(recordMediaRequest(null)),
  onDeploy: (ethAddress, point, rotation) => dispatch(deployToLandRequest(ethAddress, point, rotation))
})

export default connect(
  mapState,
  mapDispatch
)(WalletSignIn)
