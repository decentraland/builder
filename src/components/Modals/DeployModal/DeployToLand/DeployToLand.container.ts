import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { connectWalletRequest } from 'decentraland-dapps/dist/modules/wallet/actions'
import { getError as getWalletError, isConnecting, isConnected, getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import {
  isUploadingAssets,
  getProgress as getUploadProgress,
  isCreatingFiles,
  getCurrentDeploymentStatus,
  getCurrentDeployment,
  getDeploymentsForMap
} from 'modules/deployment/selectors'
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
    isCreatingFiles: isCreatingFiles(state),
    hasError: !!getWalletError(state),
    media: getMedia(state),
    ethAddress: getAddress(state),
    mediaProgress: getProgress(state),
    deploymentProgress: getUploadProgress(state),
    deploymentStatus: getCurrentDeploymentStatus(state),
    occupiedParcels: getDeploymentsForMap(state),
    deployment: getCurrentDeployment(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onConnect: () => dispatch(connectWalletRequest()),
  onRecord: () => dispatch(recordMediaRequest()),
  onDeploy: (projectId, placement) => dispatch(deployToLandRequest(projectId, placement))
})

export default connect(
  mapState,
  mapDispatch
)(WalletSignIn)
