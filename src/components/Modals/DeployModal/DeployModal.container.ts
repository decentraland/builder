import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getCurrentProject } from 'modules/project/selectors'
import { getData as getDeployments } from 'modules/deployment/selectors'
import { getActivePoolGroup } from 'modules/poolGroup/selectors'
import { getCurrentScene } from 'modules/scene/selectors'
import { MapStateProps, OwnProps } from './DeployModal.types'
import DeployModal from './DeployModal'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => ({
  deployment: getDeployments(state)[ownProps.metadata.projectId],
  currentPoolGroup: getActivePoolGroup(state),
  project: getCurrentProject(state),
  scene: getCurrentScene(state)
})

export default connect(mapState)(DeployModal)
