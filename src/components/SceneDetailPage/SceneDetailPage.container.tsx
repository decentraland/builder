import React, { useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { FETCH_LANDS_REQUEST } from 'modules/land/actions'
import { useGetProjectIdFromCurrentUrl } from 'modules/location/hooks'
import { getData as getProjects, getLoading } from 'modules/project/selectors'
import { getLoading as getLoadingLands } from 'modules/land/selectors'
import { getDeploymentsByProjectId, getLoading as getLoadingDeployment } from 'modules/deployment/selectors'
import { LOAD_PROJECTS_REQUEST, deleteProject, duplicateProjectRequest, loadProjectSceneRequest } from 'modules/project/actions'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { FETCH_DEPLOYMENTS_REQUEST, FETCH_WORLD_DEPLOYMENTS_REQUEST } from 'modules/deployment/actions'
import { FETCH_ENS_LIST_REQUEST } from 'modules/ens/actions'
import { getLoading as getLoadingENS } from 'modules/ens/selectors'
import { getData as getScenes } from 'modules/scene/selectors'
import SceneDetailPage from './SceneDetailPage'

const SceneDetailPageContainer: React.FC = () => {
  const dispatch = useDispatch()
  const projectId = useGetProjectIdFromCurrentUrl()

  const projects = useSelector(getProjects)
  const project = useMemo(() => (projectId && projectId in projects ? projects[projectId] : null), [projectId, projects])
  const deploymentsByProjectId = useSelector(getDeploymentsByProjectId)
  const deployments = useMemo(
    () => (projectId && projectId in deploymentsByProjectId ? deploymentsByProjectId[projectId] : []),
    [projectId, deploymentsByProjectId]
  )
  const scenes = useSelector(getScenes)
  const scene = useMemo(() => project && scenes[project.sceneId], [project, scenes])
  const isLoading = useSelector((state: RootState) => isLoadingType(getLoading(state), LOAD_PROJECTS_REQUEST))
  const isLoadingDeployments = useSelector(
    (state: RootState) =>
      isLoadingType(getLoadingENS(state), FETCH_ENS_LIST_REQUEST) ||
      isLoadingType(getLoadingDeployment(state), FETCH_DEPLOYMENTS_REQUEST) ||
      isLoadingType(getLoadingDeployment(state), FETCH_WORLD_DEPLOYMENTS_REQUEST) ||
      isLoadingType(getLoadingLands(state), FETCH_LANDS_REQUEST)
  )

  const onOpenModal: ActionFunction<typeof openModal> = useCallback((name, metadata) => dispatch(openModal(name, metadata)), [dispatch])
  const onDelete: ActionFunction<typeof deleteProject> = useCallback(project => dispatch(deleteProject(project)), [dispatch])
  const onDuplicate: ActionFunction<typeof duplicateProjectRequest> = useCallback(
    project => dispatch(duplicateProjectRequest(project)),
    [dispatch]
  )
  const onLoadProjectScene: ActionFunction<typeof loadProjectSceneRequest> = useCallback(
    (project, type) => dispatch(loadProjectSceneRequest(project, type)),
    [dispatch]
  )

  return (
    <SceneDetailPage
      project={project}
      deployments={deployments}
      scene={scene}
      isLoading={isLoading}
      isLoadingDeployments={isLoadingDeployments}
      onOpenModal={onOpenModal}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      onLoadProjectScene={onLoadProjectScene}
    />
  )
}

export default SceneDetailPageContainer
