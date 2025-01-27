import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { isConnected } from 'decentraland-dapps/dist/modules/wallet'
import { RootState } from 'modules/common/types'
import { getIsWorldContributorEnabled } from 'modules/features/selectors'
import { FETCH_ENS_LIST_REQUEST, FETCH_EXTERNAL_NAMES_REQUEST, fetchContributableNamesRequest } from 'modules/ens/actions'
import {
  getENSByWallet,
  getError as getENSError,
  getExternalNamesForConnectedWallet,
  getLoading as getLoadingENS,
  getTotal as getTotalENS
} from 'modules/ens/selectors'
import { FETCH_WORLD_DEPLOYMENTS_REQUEST, clearDeploymentRequest } from 'modules/deployment/actions'
import { getDeploymentsByWorlds, getError as getDeploymentsError, getLoading as getDeploymentsLoading } from 'modules/deployment/selectors'
import { FETCH_LANDS_REQUEST } from 'modules/land/actions'
import { getLoading as getLandsLoading } from 'modules/land/selectors'
import { isLoggingIn, isLoggedIn } from 'modules/identity/selectors'
import { getProjects } from 'modules/ui/dashboard/selectors'
import { getConnectedWalletStats, getLoading as getLoadingWorlds, getWorldsPermissions } from 'modules/worlds/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './WorldListPage.types'
import WorldListPage from './WorldListPage'

const mapState = (state: RootState): MapStateProps => ({
  ensList: getENSByWallet(state),
  externalNames: getExternalNamesForConnectedWallet(state),
  deploymentsByWorlds: getDeploymentsByWorlds(state),
  projects: getProjects(state),
  worldsPermissions: getWorldsPermissions(state),
  error: getENSError(state)?.message ?? getDeploymentsError(state) ?? undefined,
  isLoading:
    isLoadingType(getLoadingENS(state), FETCH_ENS_LIST_REQUEST) ||
    isLoadingType(getDeploymentsLoading(state), FETCH_WORLD_DEPLOYMENTS_REQUEST) ||
    isLoadingType(getLandsLoading(state), FETCH_LANDS_REQUEST) ||
    isLoadingType(getLoadingWorlds(state), FETCH_WORLD_DEPLOYMENTS_REQUEST) ||
    isLoadingType(getLoadingENS(state), FETCH_EXTERNAL_NAMES_REQUEST) ||
    isLoggingIn(state),
  isLoggedIn: isLoggedIn(state),
  worldsWalletStats: getConnectedWalletStats(state),
  isConnected: isConnected(state),
  isWorldContributorEnabled: getIsWorldContributorEnabled(state),
  ensTotal: getTotalENS(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenYourStorageModal: metadata => dispatch(openModal('WorldsYourStorageModal', metadata)),
  onOpenPermissionsModal: (name, isCollaboratorsTabShown) =>
    dispatch(openModal('WorldPermissionsModal', { worldName: name, isCollaboratorsTabShown })),
  onOpenWorldsForENSOwnersAnnouncementModal: () => dispatch(openModal('WorldsForENSOwnersAnnouncementModal')),
  onUnpublishWorld: deploymentId => dispatch(clearDeploymentRequest(deploymentId)),
  onFetchContributableNames: () => dispatch(fetchContributableNamesRequest())
})

export default connect(mapState, mapDispatch)(WorldListPage)
