import React, { useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { isConnected } from 'decentraland-dapps/dist/modules/wallet'
import { getIsWorldContributorEnabled } from 'modules/features/selectors'
import { WorldsYourStorageModalMetadata } from 'components/Modals/WorldsYourStorageModal/WorldsYourStorageModal.types'
import {
  FETCH_ENS_LIST_REQUEST,
  FETCH_EXTERNAL_NAMES_REQUEST,
  fetchContributableNamesRequest,
  fetchENSListRequest
} from 'modules/ens/actions'
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
import { useGetProjects } from 'modules/ui/dashboard/hooks'
import { getConnectedWalletStats, getLoading as getLoadingWorlds, getWorldsPermissions } from 'modules/worlds/selectors'
import WorldListPage from './WorldListPage'

const WorldListPageContainer: React.FC = () => {
  const dispatch = useDispatch()
  const projects = useGetProjects()

  const ensList = useSelector(getENSByWallet)
  const externalNames = useSelector(getExternalNamesForConnectedWallet)
  const deploymentsByWorlds = useSelector(getDeploymentsByWorlds)
  const worldsPermissions = useSelector(getWorldsPermissions)
  const ensError = useSelector(getENSError)
  const deploymentsError = useSelector(getDeploymentsError)
  const loadingENS = useSelector(getLoadingENS)
  const deploymentsLoading = useSelector(getDeploymentsLoading)
  const landsLoading = useSelector(getLandsLoading)
  const loadingWorlds = useSelector(getLoadingWorlds)
  const loggingIn = useSelector(isLoggingIn)
  const loggedIn = useSelector(isLoggedIn)
  const worldsWalletStats = useSelector(getConnectedWalletStats)
  const connected = useSelector(isConnected)
  const worldContributorEnabled = useSelector(getIsWorldContributorEnabled)
  const ensTotal = useSelector(getTotalENS)

  // Computed values
  const error = ensError?.message ?? deploymentsError ?? undefined
  const isLoading = useMemo(
    () =>
      isLoadingType(loadingENS, FETCH_ENS_LIST_REQUEST) ||
      isLoadingType(deploymentsLoading, FETCH_WORLD_DEPLOYMENTS_REQUEST) ||
      isLoadingType(landsLoading, FETCH_LANDS_REQUEST) ||
      isLoadingType(loadingWorlds, FETCH_WORLD_DEPLOYMENTS_REQUEST) ||
      isLoadingType(loadingENS, FETCH_EXTERNAL_NAMES_REQUEST) ||
      loggingIn,
    [loadingENS, deploymentsLoading, landsLoading, loadingWorlds, loggingIn]
  )

  const onOpenYourStorageModal = useCallback(
    (metadata: WorldsYourStorageModalMetadata) => dispatch(openModal('WorldsYourStorageModal', metadata)),
    [dispatch]
  )
  const onOpenPermissionsModal = useCallback(
    (name: string, isCollaboratorsTabShown?: boolean) =>
      dispatch(openModal('CreatorHubUpgradeModal', { worldName: name, isCollaboratorsTabShown, variant: 'permissions' })),
    [dispatch]
  )
  const onOpenWorldsForENSOwnersAnnouncementModal = useCallback(
    () => dispatch(openModal('WorldsForENSOwnersAnnouncementModal')),
    [dispatch]
  )
  const onUnpublishWorld: ActionFunction<typeof clearDeploymentRequest> = useCallback(
    deploymentId => dispatch(clearDeploymentRequest(deploymentId)),
    [dispatch]
  )
  const onFetchContributableNames: ActionFunction<typeof fetchContributableNamesRequest> = useCallback(
    () => dispatch(fetchContributableNamesRequest()),
    [dispatch]
  )
  const onFetchENSList: ActionFunction<typeof fetchENSListRequest> = useCallback(
    (first, skip) => dispatch(fetchENSListRequest(first, skip)),
    [dispatch]
  )

  return (
    <WorldListPage
      ensList={ensList}
      externalNames={externalNames}
      deploymentsByWorlds={deploymentsByWorlds}
      projects={projects}
      worldsPermissions={worldsPermissions}
      error={error}
      isLoading={isLoading}
      isLoggedIn={loggedIn}
      worldsWalletStats={worldsWalletStats}
      isConnected={connected}
      isWorldContributorEnabled={worldContributorEnabled}
      ensTotal={ensTotal}
      onOpenYourStorageModal={onOpenYourStorageModal}
      onOpenPermissionsModal={onOpenPermissionsModal}
      onOpenWorldsForENSOwnersAnnouncementModal={onOpenWorldsForENSOwnersAnnouncementModal}
      onUnpublishWorld={onUnpublishWorld}
      onFetchContributableNames={onFetchContributableNames}
      onFetchENSList={onFetchENSList}
    />
  )
}

export default WorldListPageContainer
