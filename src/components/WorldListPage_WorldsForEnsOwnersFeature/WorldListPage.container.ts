import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { FETCH_ENS_LIST_REQUEST } from 'modules/ens/actions'
import { getENSByWallet, getError as getENSError, getLoading } from 'modules/ens/selectors'
import { FETCH_WORLD_DEPLOYMENTS_REQUEST } from 'modules/deployment/actions'
import { getDeploymentsByWorlds, getError as getDeploymentsError, getLoading as getDeploymentsLoading } from 'modules/deployment/selectors'
import { FETCH_LANDS_REQUEST } from 'modules/land/actions'
import { getLoading as getLandsLoading } from 'modules/land/selectors'
import { isLoggingIn, isLoggedIn } from 'modules/identity/selectors'
import { getProjects } from 'modules/ui/dashboard/selectors'
import { fetchWorldsWalletStatsRequest } from 'modules/worlds/actions'
import { getConnectedWalletStats, getLoading as getLoadingWorlds } from 'modules/worlds/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './WorldListPage.types'
import WorldListPage from './WorldListPage'

const mapState = (state: RootState): MapStateProps => ({
  ensList: getENSByWallet(state),
  deploymentsByWorlds: getDeploymentsByWorlds(state),
  projects: getProjects(state),
  error: getENSError(state)?.message ?? getDeploymentsError(state) ?? undefined,
  isLoading:
    isLoadingType(getLoading(state), FETCH_ENS_LIST_REQUEST) ||
    isLoadingType(getDeploymentsLoading(state), FETCH_WORLD_DEPLOYMENTS_REQUEST) ||
    isLoadingType(getLandsLoading(state), FETCH_LANDS_REQUEST) ||
    isLoadingType(getLoadingWorlds(state), FETCH_WORLD_DEPLOYMENTS_REQUEST) ||
    isLoggingIn(state),
  isLoggedIn: isLoggedIn(state),
  worldsWalletStats: getConnectedWalletStats(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onFetchWorldsWalletStats: () => dispatch(fetchWorldsWalletStatsRequest())
})

export default connect(mapState, mapDispatch)(WorldListPage)
