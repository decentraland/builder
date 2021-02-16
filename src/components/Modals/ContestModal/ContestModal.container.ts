import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getCurrentProject } from 'modules/project/selectors'
import { getActivePoolGroup } from 'modules/poolGroup/selectors'
import { isReady, isLoading } from 'modules/editor/selectors'
import { shareProject } from 'modules/project/actions'
import { shareScene } from 'modules/ui/share/actions'
import { ShareTarget } from 'modules/ui/share/types'
import { openModal } from 'modules/modal/actions'
import { getError, getProgress, isLoading as isSubmitting } from 'modules/deployment/selectors'
import { deployToPoolRequest } from 'modules/deployment/actions'
import { PoolDeploymentAdditionalFields } from 'lib/api/builder'
import { isLoggedIn } from 'modules/identity/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './ContestModal.types'
import ContestModal from './ContestModal'

const mapState = (state: RootState, _ownProps: OwnProps): MapStateProps => ({
  error: getError(state),
  project: getCurrentProject(state)!,
  poolGroup: getActivePoolGroup(state),
  isReady: isReady(state),
  isLoading: !isReady(state) || isLoading(state),
  isLoggedIn: isLoggedIn(state),
  progress: getProgress(state).value,
  isSubmitting: isSubmitting(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onUpdate: (id: string) => dispatch(shareProject(id)),
  onShare: (target: ShareTarget) => dispatch(shareScene(target)),
  onDeployToPool: (projectId: string, additionalInfo: PoolDeploymentAdditionalFields | null = null) =>
    dispatch(deployToPoolRequest(projectId, additionalInfo))
})

export default connect(mapState, mapDispatch)(ContestModal)
