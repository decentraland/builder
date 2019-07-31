import { connect } from 'react-redux'

import { connectWalletRequest } from 'decentraland-dapps/dist/modules/wallet/actions'
import { getError as getWalletError, isConnecting, isConnected, getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { clearDeploymentRequest } from 'modules/deployment/actions'
import { RootState } from 'modules/common/types'
import { getData as getProjects } from 'modules/project/selectors'
import {
  isUploadingAssets,
  getProgress as getUploadProgress,
  isCreatingFiles,
  getDeploymentStatus,
  getError as getDeploymentError
} from 'modules/deployment/selectors'

import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './ClearDeployment.types'
import WalletSignIn from './ClearDeployment'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  return {
    project: getProjects(state)[ownProps.projectId],
    isConnecting: isConnecting(state),
    isConnected: isConnected(state),
    isUploadingAssets: isUploadingAssets(state),
    isCreatingFiles: isCreatingFiles(state),
    hasError: !!getWalletError(state),
    ethAddress: getAddress(state),
    deploymentProgress: getUploadProgress(state),
    deploymentStatus: getDeploymentStatus(state)[ownProps.projectId],
    error: getDeploymentError(state)
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
