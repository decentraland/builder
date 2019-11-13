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
  onDeployToPool: (projectId: string) => dispatch(deployToPoolRequest(projectId)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onLogin: options => dispatch(login(options))
})

export default connect(
  mapState,
  mapDispatch
)(DeployModal)
