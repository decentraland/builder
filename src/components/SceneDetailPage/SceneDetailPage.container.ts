import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { FETCH_LANDS_REQUEST } from 'modules/land/actions'
import { getProjectId } from 'modules/location/selectors'
import { getData as getProjects, getLoading } from 'modules/project/selectors'
import { getLoading as getLoadingLands } from 'modules/land/selectors'
import { getDeploymentsByProjectId, getLoading as getLoadingDeployment } from 'modules/deployment/selectors'
import { LOAD_PROJECTS_REQUEST, deleteProject, duplicateProjectRequest, loadProjectSceneRequest } from 'modules/project/actions'
import { openModal } from 'modules/modal/actions'
import { FETCH_DEPLOYMENTS_REQUEST, FETCH_WORLD_DEPLOYMENTS_REQUEST } from 'modules/deployment/actions'
import { FETCH_ENS_LIST_REQUEST } from 'modules/ens/actions'
import { getLoading as getLoadingENS } from 'modules/ens/selectors'
import { getData as getScenes } from 'modules/scene/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './SceneDetailPage.types'
import SceneDetailPage from './SceneDetailPage'

const mapState = (state: RootState): MapStateProps => {
  const projectId = getProjectId(state)
  const projects = getProjects(state)
  const project = projectId && projectId in projects ? projects[projectId] : null
  const deploymentsByProjectId = getDeploymentsByProjectId(state)
  const deployments = projectId && projectId in deploymentsByProjectId ? deploymentsByProjectId[projectId] : []
  const scene = project && getScenes(state)[project.sceneId]
  return {
    project,
    deployments,
    scene,
    isLoading: isLoadingType(getLoading(state), LOAD_PROJECTS_REQUEST),
    isLoadingDeployments:
      isLoadingType(getLoadingENS(state), FETCH_ENS_LIST_REQUEST) ||
      isLoadingType(getLoadingDeployment(state), FETCH_DEPLOYMENTS_REQUEST) ||
      isLoadingType(getLoadingDeployment(state), FETCH_WORLD_DEPLOYMENTS_REQUEST) ||
      isLoadingType(getLoadingLands(state), FETCH_LANDS_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onDelete: project => dispatch(deleteProject(project)),
  onDuplicate: project => dispatch(duplicateProjectRequest(project)),
  onLoadProjectScene: (project, type) => dispatch(loadProjectSceneRequest(project, type))
})

export default connect(mapState, mapDispatch)(SceneDetailPage)
