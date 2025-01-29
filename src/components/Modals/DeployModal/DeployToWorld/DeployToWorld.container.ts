import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { fetchContributableNamesRequest } from 'modules/ens/actions'
import { getCurrentProject } from 'modules/project/selectors'
import { getIsWorldContributorEnabled } from 'modules/features/selectors'
import {
  getNamesListWithDeploymentPermissions,
  getENSByWallet,
  getExternalNamesForConnectedWallet,
  isLoading as isLoadingENS
} from 'modules/ens/selectors'
import { deployToWorldRequest } from 'modules/deployment/actions'
import { getCurrentMetrics, getCurrentScene } from 'modules/scene/selectors'
import { recordMediaRequest } from 'modules/media/actions'
import { getDeploymentsByWorlds, getProgress as getUploadProgress, getError, isLoading } from 'modules/deployment/selectors'
import { Project } from 'modules/project/types'
import { MapDispatch, MapDispatchProps, MapStateProps } from './DeployToWorld.types'

import DeployToWorld from './DeployToWorld'
import { getWallet } from 'modules/wallet/selectors'

const mapState = (state: RootState): MapStateProps => {
  return {
    ensList: getENSByWallet(state),
    externalNames: getExternalNamesForConnectedWallet(state),
    contributableNames: getNamesListWithDeploymentPermissions(state),
    project: getCurrentProject(state) as Project,
    scene: getCurrentScene(state),
    metrics: getCurrentMetrics(state),
    deployments: getDeploymentsByWorlds(state),
    deploymentProgress: getUploadProgress(state),
    wallet: getWallet(state),
    error: getError(state),
    isLoading: isLoading(state) || isLoadingENS(state),
    isWorldContributorEnabled: getIsWorldContributorEnabled(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onPublish: (projectId: string, name: string) => {
    return dispatch(deployToWorldRequest(projectId, name))
  },
  onRecord: () => dispatch(recordMediaRequest()),
  onFetchContributableNames: () => dispatch(fetchContributableNamesRequest())
})

export default connect(mapState, mapDispatch)(DeployToWorld)
