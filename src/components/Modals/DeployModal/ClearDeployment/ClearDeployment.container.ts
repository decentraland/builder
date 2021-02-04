import { connect } from 'react-redux'

import { getError as getWalletError, isConnecting, isConnected, getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { clearDeploymentRequest } from 'modules/deployment/actions'
import { openModal } from 'modules/modal/actions'
import { RootState } from 'modules/common/types'
import {
  getData as getDeployments,
  isUploadingAssets,
  getProgress as getUploadProgress,
  isCreatingFiles,
  getError as getDeploymentError
} from 'modules/deployment/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './ClearDeployment.types'
import ClearDeployment from './ClearDeployment'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => ({
  deployment: getDeployments(state)[ownProps.deploymentId] || null,
  isConnecting: isConnecting(state),
  isConnected: isConnected(state),
  isUploadingAssets: isUploadingAssets(state),
  isCreatingFiles: isCreatingFiles(state),
  hasError: !!getWalletError(state),
  ethAddress: getAddress(state),
  deploymentProgress: getUploadProgress(state),
  error: getDeploymentError(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onClearDeployment: deploymentId => dispatch(clearDeploymentRequest(deploymentId))
})

export default connect(mapState, mapDispatch)(ClearDeployment)
