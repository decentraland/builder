import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { connectWalletRequest } from 'decentraland-dapps/dist/modules/wallet/actions'
import { getError as getWalletError, isConnecting, isConnected } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './DeployToLand.types'
import WalletSignIn from './DeployToLand'
import { isRecording, isUploadingAssets, getImages } from 'modules/deployment/selectors'

const mapState = (state: RootState): MapStateProps => ({
  isConnecting: isConnecting(state),
  isConnected: isConnected(state),
  isRecording: isRecording(state),
  isUploadingAssets: isUploadingAssets(state),
  hasError: !!getWalletError(state),
  images: getImages(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onConnect: () => dispatch(connectWalletRequest())
})

export default connect(
  mapState,
  mapDispatch
)(WalletSignIn)
