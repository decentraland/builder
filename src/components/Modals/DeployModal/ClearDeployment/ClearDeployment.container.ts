import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { connectWalletRequest } from 'decentraland-dapps/dist/modules/wallet/actions'
import { getError as getWalletError, isConnecting, isConnected, getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import {
  isUploadingAssets,
  getProgress as getUploadProgress,
  isCreatingFiles,
  getCurrentDeploymentStatus
} from 'modules/deployment/selectors'

import { MapStateProps, MapDispatchProps, MapDispatch } from './ClearDeployment.types'
import WalletSignIn from './ClearDeployment'
import { clearDeploymentRequest } from 'modules/deployment/actions'

import { getCurrentProject } from 'modules/project/selectors'

const mapState = (state: RootState): MapStateProps => {
  return {
    project: getCurrentProject(state),
    isConnecting: isConnecting(state),
    isConnected: isConnected(state),
    isUploadingAssets: isUploadingAssets(state),
    isCreatingFiles: isCreatingFiles(state),
    hasError: !!getWalletError(state),
    ethAddress: getAddress(state),
    deploymentProgress: getUploadProgress(state),
    deploymentStatus: getCurrentDeploymentStatus(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onConnect: () => dispatch(connectWalletRequest()),
  onClearDeployment: placement => dispatch(clearDeploymentRequest(placement))
})

export default connect(
  mapState,
  mapDispatch
)(WalletSignIn)
