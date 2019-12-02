import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, OwnProps } from './ContestModal.types'
import ShareModal from './ContestModal'
import { getCurrentProject } from 'modules/project/selectors'
import { getActivePoolGroup } from 'modules/poolGroup/selectors'
import { isReady, isLoading } from 'modules/editor/selectors'
import { shareProject } from 'modules/project/actions'
import { isLoggedIn } from 'modules/auth/selectors'
import { login } from 'modules/auth/actions'
import { shareScene } from 'modules/ui/share/actions'
import { ShareTarget } from 'modules/ui/share/types'
import { openModal } from 'modules/modal/actions'
import { isRecording, getProgress } from 'modules/media/selectors'
import { isUploadingRecording, getError } from 'modules/deployment/selectors'
import { deployToPoolRequest } from 'modules/deployment/actions'
import { PoolDeploymentAdditionalFields } from 'lib/api/builder'

const mapState = (state: RootState, _ownProps: OwnProps): MapStateProps => ({
  error: getError(state),
  project: getCurrentProject(state)!,
  poolGroup: getActivePoolGroup(state),
  isReady: isReady(state),
  isLoading: !isReady(state) || isLoading(state),
  isLoggedIn: isLoggedIn(state),
  progress: getProgress(state),
  isRecording: isRecording(state),
  isUploadingRecording: isUploadingRecording(state)
})

const mapDispatch = (dispatch: Dispatch): MapDispatchProps => ({
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onUpdate: (id: string) => dispatch(shareProject(id)),
  onLogin: options => dispatch(login(options)),
  onShare: (target: ShareTarget) => dispatch(shareScene(target)),
  onDeployToPool: (projectId: string, additionalInfo: PoolDeploymentAdditionalFields | null = null) =>
    dispatch(deployToPoolRequest(projectId, additionalInfo))
})

export default connect(
  mapState,
  mapDispatch
)(ShareModal)
