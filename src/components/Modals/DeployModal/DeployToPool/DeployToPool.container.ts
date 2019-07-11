import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { Project } from 'modules/project/types'
import { User } from 'modules/user/types'
import { getEmail } from 'modules/user/selectors'
import { isLoading, getError, getProgress, isUploadingRecording } from 'modules/deployment/selectors'
import { deployToPoolRequest } from 'modules/deployment/actions'
import { getCurrentProject } from 'modules/project/selectors'
import { setUserProfile } from 'modules/user/actions'
import { getMedia, isRecording } from 'modules/media/selectors'
import { editProjectRequest } from 'modules/project/actions'
import { MapStateProps, MapDispatchProps } from './DeployToPool.types'
import DeployModal from './DeployToPool'

const mapState = (state: RootState): MapStateProps => ({
  error: getError(state),
  userEmail: getEmail(state),
  currentProject: getCurrentProject(state),
  isLoading: isLoading(state),
  progress: getProgress(state).value,
  isRecording: isRecording(state),
  isUploadingRecording: isUploadingRecording(state),
  media: getMedia(state),
  ethAddress: getAddress(state)
})

const mapDispatch = (dispatch: Dispatch): MapDispatchProps => ({
  onDeployToPool: (projectId: string) => dispatch(deployToPoolRequest(projectId)),
  onSaveUser: (user: Partial<User>) => dispatch(setUserProfile(user)),
  onSaveProject: (id: string, project: Partial<Project>) => dispatch(editProjectRequest(id, project))
})

export default connect(
  mapState,
  mapDispatch
)(DeployModal)
