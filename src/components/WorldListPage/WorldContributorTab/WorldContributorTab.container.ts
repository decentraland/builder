import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading'
import { getContributableNamesList, getLoading as getLoadingENS, getContributableNamesError } from 'modules/ens/selectors'
import { RootState } from 'modules/common/types'
import { getDeploymentsByWorlds, getLoading as getDeploymentLoading } from 'modules/deployment/selectors'
import { getProjects } from 'modules/ui/dashboard/selectors'
import { FETCH_WORLD_DEPLOYMENTS_REQUEST, clearDeploymentRequest } from 'modules/deployment/actions'
import { FETCH_CONTRIBUTABLE_NAMES_REQUEST } from 'modules/ens/actions'
import WorldContributorTab from './WorldContributorTab'
import { MapStateProp, MapDispatch, MapDispatchProps } from './WorldContributorTab.types'

const mapState = (state: RootState): MapStateProp => ({
  items: getContributableNamesList(state),
  deploymentsByWorlds: getDeploymentsByWorlds(state),
  projects: getProjects(state),
  error: getContributableNamesError(state),
  loading:
    isLoadingType(getLoadingENS(state), FETCH_CONTRIBUTABLE_NAMES_REQUEST) ||
    isLoadingType(getDeploymentLoading(state), FETCH_WORLD_DEPLOYMENTS_REQUEST)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onUnpublishWorld: deploymentId => dispatch(clearDeploymentRequest(deploymentId))
})

export default connect(mapState, mapDispatch)(WorldContributorTab)
