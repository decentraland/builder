import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { RootState } from 'modules/common/types'
import { getCurrentProject } from 'modules/project/selectors'
import { getENSByWallet } from 'modules/ens/selectors'
import { deployToWorldRequest } from 'modules/deployment/actions'
import { getDeploymentsByWorlds, getProgress as getUploadProgress, isLoading } from 'modules/deployment/selectors'
import { MapDispatch, MapDispatchProps, MapStateProps } from './DeployToWorld.types'
import DeployToWorld from './DeployToWorld'
import { getCurrentMetrics } from 'modules/scene/selectors'

const mapState = (state: RootState): MapStateProps => ({
  ensList: getENSByWallet(state),
  project: getCurrentProject(state),
  metrics: getCurrentMetrics(state),
  deployments: getDeploymentsByWorlds(state),
  deploymentProgress: getUploadProgress(state),
  isLoading: isLoading(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onPublish: (projectId: string, name: string) => {
    return dispatch(deployToWorldRequest(projectId, name))
  },
  onNavigate: (path: string) => dispatch(push(path))
})

export default connect(mapState, mapDispatch)(DeployToWorld)
