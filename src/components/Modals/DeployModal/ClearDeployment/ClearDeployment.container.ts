import { connect } from 'react-redux'

import { connectWalletRequest } from 'decentraland-dapps/dist/modules/wallet/actions'
import { getError as getWalletError, isConnecting, isConnected, getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { clearDeploymentRequest } from 'modules/deployment/actions'
import { RootState } from 'modules/common/types'
import { getData as getDeployments } from 'modules/deployment/selectors'
import {
  isUploadingAssets,
  getProgress as getUploadProgress,
  isCreatingFiles,
  getError as getDeploymentError
} from 'modules/deployment/selectors'

import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './ClearDeployment.types'
import ClearDeployment from './ClearDeployment'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  return {
    deployment: getDeployments(state)[ownProps.deploymentId] || null,
    isConnecting: isConnecting(state),
    isConnected: isConnected(state),
    isUploadingAssets: isUploadingAssets(state),
    isCreatingFiles: isCreatingFiles(state),
    hasError: !!getWalletError(state),
    ethAddress: getAddress(state),
    deploymentProgress: getUploadProgress(state),
    error: getDeploymentError(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onConnect: () => dispatch(connectWalletRequest()),
  onClearDeployment: deploymentId => dispatch(clearDeploymentRequest(deploymentId))
})

export default connect(mapState, mapDispatch)(ClearDeployment)
