import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading'
import { getContributableNamesList, getLoading as getLoadingENS, getContributableNamesError } from 'modules/ens/selectors'
import { RootState } from 'modules/common/types'
import { getDeploymentsByWorlds, getLoading as getDeploymentLoading } from 'modules/deployment/selectors'
import { FETCH_WORLD_DEPLOYMENTS_REQUEST, clearDeploymentRequest } from 'modules/deployment/actions'
import { useGetProjects } from 'modules/ui/dashboard/hooks'
import { FETCH_CONTRIBUTABLE_NAMES_REQUEST } from 'modules/ens/actions'
import WorldContributorTab from './WorldContributorTab'

const WorldContributorTabContainer: React.FC = () => {
  const dispatch = useDispatch()
  const projects = useGetProjects()

  const items = useSelector(getContributableNamesList)
  const deploymentsByWorlds = useSelector(getDeploymentsByWorlds)
  const error = useSelector(getContributableNamesError)
  const loading = useSelector(
    (state: RootState) =>
      isLoadingType(getLoadingENS(state), FETCH_CONTRIBUTABLE_NAMES_REQUEST) ||
      isLoadingType(getDeploymentLoading(state), FETCH_WORLD_DEPLOYMENTS_REQUEST)
  )

  const onUnpublishWorld: ActionFunction<typeof clearDeploymentRequest> = useCallback(
    deploymentId => dispatch(clearDeploymentRequest(deploymentId)),
    [dispatch]
  )

  return (
    <WorldContributorTab
      items={items}
      deploymentsByWorlds={deploymentsByWorlds}
      projects={projects}
      loading={loading}
      error={error}
      onUnpublishWorld={onUnpublishWorld}
    />
  )
}

export default WorldContributorTabContainer
