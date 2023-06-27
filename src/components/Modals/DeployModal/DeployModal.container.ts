import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getCurrentProject } from 'modules/project/selectors'
import { getData as getDeployments } from 'modules/deployment/selectors'
import { getActivePoolGroup } from 'modules/poolGroup/selectors'
import { getIsDeployToWorldsEnabled } from 'modules/features/selectors'
import { MapStateProps, OwnProps } from './DeployModal.types'
import DeployModal from './DeployModal'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => ({
  deployment: getDeployments(state)[ownProps.metadata.projectId],
  isDeployToWorldEnabled: getIsDeployToWorldsEnabled(state),
  currentPoolGroup: getActivePoolGroup(state),
  project: getCurrentProject(state)
})

export default connect(mapState)(DeployModal)
