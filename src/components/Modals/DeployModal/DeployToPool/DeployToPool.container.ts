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

const mapState = (state: RootState): MapStateProps => ({
  error: getError(state),
  project: getCurrentProject(state),
  isLoading: isLoading(state),
  progress: getProgress(state).value,
  isRecording: isRecording(state),
  isUploadingRecording: isUploadingRecording(state),
  media: getMedia(state),
  isLoggedIn: isLoggedIn(state)
})

const mapDispatch = (dispatch: Dispatch): MapDispatchProps => ({
  onDeployToPool: (projectId: string) => dispatch(deployToPoolRequest(projectId)),
  onLogin: () => dispatch(login())
})

export default connect(
  mapState,
  mapDispatch
)(DeployModal)
