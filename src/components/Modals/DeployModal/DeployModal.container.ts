import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { Project } from 'modules/project/types'
import { User } from 'modules/user/types'
import { getEmail, getEthAddress } from 'modules/user/selectors'
import { isLoading, getError, getThumbnail, getProgress, getStage } from 'modules/deployment/selectors'
import { deployToPoolRequest } from 'modules/deployment/actions'
import { getCurrentProject } from 'modules/project/selectors'
import { setUserProfile } from 'modules/user/actions'
import { editProjectRequest } from 'modules/project/actions'
import { MapStateProps, MapDispatchProps } from './DeployModal.types'
import DeployModal from './DeployModal'

const mapState = (state: RootState): MapStateProps => ({
  error: getError(state),
  userEmail: getEmail(state),
  userEthAddress: getEthAddress(state),
  currentProject: getCurrentProject(state),
  isLoading: isLoading(state),
  progress: getProgress(state),
  stage: getStage(state),
  deploymentThumbnail: getThumbnail(state)
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
