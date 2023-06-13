import { connect } from 'react-redux'
import { push, replace } from 'connected-react-router'
import { RootState } from 'modules/common/types'
import { getCurrentProject } from 'modules/project/selectors'
import { getENSByWallet } from 'modules/ens/selectors'
import { deployToWorldRequest } from 'modules/deployment/actions'
import { getCurrentMetrics } from 'modules/scene/selectors'
import { recordMediaRequest } from 'modules/media/actions'
import { getDeploymentsByWorlds, getProgress as getUploadProgress, getError, isLoading } from 'modules/deployment/selectors'
import { Project } from 'modules/project/types'
import { MapDispatch, MapDispatchProps, MapStateProps } from './DeployToWorld.types'

import DeployToWorld from './DeployToWorld'

const mapState = (state: RootState): MapStateProps => ({
  ensList: getENSByWallet(state),
  project: getCurrentProject(state) as Project,
  metrics: getCurrentMetrics(state),
  deployments: getDeploymentsByWorlds(state),
  deploymentProgress: getUploadProgress(state),
  error: getError(state),
  isLoading: isLoading(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onPublish: (projectId: string, name: string) => {
    return dispatch(deployToWorldRequest(projectId, name))
  },
  onRecord: () => dispatch(recordMediaRequest()),
  onNavigate: path => dispatch(push(path)),
  onReplace: (path, locationState) => dispatch(replace(path, locationState))
})

export default connect(mapState, mapDispatch)(DeployToWorld)
