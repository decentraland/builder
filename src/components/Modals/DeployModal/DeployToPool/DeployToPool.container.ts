import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { isLoading, getError, isUploadingRecording } from 'modules/deployment/selectors'
import { deployToPoolRequest } from 'modules/deployment/actions'
import { getCurrentProject } from 'modules/project/selectors'
import { getMedia, isRecording, getProgress } from 'modules/media/selectors'
import { openModal } from 'modules/modal/actions'
import { isReady } from 'modules/editor/selectors'
import { PoolDeploymentAdditionalFields } from 'lib/api/builder'
import { isLoggedIn } from 'modules/identity/selectors'
import { loginRequest } from 'modules/identity/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './DeployToPool.types'
import DeployToLand from './DeployToPool'

const mapState = (state: RootState): MapStateProps => ({
  error: getError(state),
  project: getCurrentProject(state),
  isLoading: isLoading(state),
  isReady: isReady(state),
  progress: getProgress(state),
  isRecording: isRecording(state),
  isUploadingRecording: isUploadingRecording(state),
  media: getMedia(state),
  isLoggedIn: isLoggedIn(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onDeployToPool: (projectId: string, additionalInfo: PoolDeploymentAdditionalFields | null = null) =>
    dispatch(deployToPoolRequest(projectId, additionalInfo)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onLogin: () => dispatch(loginRequest())
})

export default connect(mapState, mapDispatch)(DeployToLand)
