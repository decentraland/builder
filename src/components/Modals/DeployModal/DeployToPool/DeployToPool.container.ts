import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { isLoading, getError, getProgress, isUploadingRecording } from 'modules/deployment/selectors'
import { deployToPoolRequest } from 'modules/deployment/actions'
import { getCurrentProject } from 'modules/project/selectors'
import { getMedia, isRecording } from 'modules/media/selectors'
import { isLoggedIn } from 'modules/auth/selectors'
import { login } from 'modules/auth/actions'
import { MapStateProps, MapDispatchProps } from './DeployToPool.types'
import DeployModal from './DeployToPool'
import { openModal } from 'modules/modal/actions'
import { isReady } from 'modules/editor/selectors'
import { PoolDeploymentAdditionalFields } from 'lib/api/builder'

const mapState = (state: RootState): MapStateProps => ({
  error: getError(state),
  project: getCurrentProject(state),
  isLoading: isLoading(state),
  isReady: isReady(state),
  progress: getProgress(state).value,
  isRecording: isRecording(state),
  isUploadingRecording: isUploadingRecording(state),
  media: getMedia(state),
  isLoggedIn: isLoggedIn(state)
})

const mapDispatch = (dispatch: Dispatch): MapDispatchProps => ({
  onDeployToPool: (projectId: string, additionalInfo: PoolDeploymentAdditionalFields | null = null) =>
    dispatch(deployToPoolRequest(projectId, additionalInfo)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onLogin: options => dispatch(login(options))
})

export default connect(
  mapState,
  mapDispatch
)(DeployModal)
