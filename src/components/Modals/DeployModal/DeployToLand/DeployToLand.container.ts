import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { getError as getWalletError, isConnecting, isConnected, getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import {
  isLoading,
  isUploadingAssets,
  getProgress as getUploadProgress,
  getError as getDeploymentError,
  isCreatingFiles,
  getCurrentDeploymentStatus,
  getCurrentDeployments,
  isUploadingRecording
} from 'modules/deployment/selectors'
import { RootState } from 'modules/common/types'
import { deployToLandRequest } from 'modules/deployment/actions'
import { recordMediaRequest } from 'modules/media/actions'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { getCurrentProject } from 'modules/project/selectors'
import { getLandTiles, getDeploymentsByCoord } from 'modules/land/selectors'
import { isLoggedIn } from 'modules/identity/selectors'
import { getENSByWallet } from 'modules/ens/selectors'
import { getMedia, isRecording, getProgress } from 'modules/media/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './DeployToLand.types'
import DeployToLand from './DeployToLand'

const mapState = (state: RootState): MapStateProps => ({
  ensList: getENSByWallet(state),
  project: getCurrentProject(state)!,
  isConnecting: isConnecting(state),
  isConnected: isConnected(state),
  isRecording: isRecording(state),
  isUploadingAssets: isUploadingAssets(state),
  isUploadingRecording: isUploadingRecording(state),
  isCreatingFiles: isCreatingFiles(state),
  isLoading: isLoading(state),
  isLoggedIn: isLoggedIn(state),
  walletError: !!getWalletError(state),
  media: getMedia(state),
  ethAddress: getAddress(state),
  mediaProgress: getProgress(state),
  deploymentProgress: getUploadProgress(state),
  deploymentStatus: getCurrentDeploymentStatus(state),
  deploymentsByCoord: getDeploymentsByCoord(state),
  landTiles: getLandTiles(state),
  deployments: getCurrentDeployments(state),
  error: getDeploymentError(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onRecord: () => dispatch(recordMediaRequest()),
  onDeploy: (projectId, placement, overrideDeploymentId) => dispatch(deployToLandRequest(projectId, placement, overrideDeploymentId))
})

export default connect(mapState, mapDispatch)(withRouter(DeployToLand))
