import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { RootState } from 'modules/common/types'
import { getProjectId } from 'modules/location/selectors'
import { getData as getProjects, getLoading } from 'modules/project/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './SceneDetailPage.types'
import { getDeploymentsByProjectId } from 'modules/deployment/selectors'
import SceneDetailPage from './SceneDetailPage'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { LOAD_PROJECTS_REQUEST, deleteProject, duplicateProject } from 'modules/project/actions'
import { openModal } from 'modules/modal/actions'

const mapState = (state: RootState): MapStateProps => {
  const projectId = getProjectId(state)
  const projects = getProjects(state)
  const project = projectId && projectId in projects ? projects[projectId] : null
  const deploymentsByProjectId = getDeploymentsByProjectId(state)
  const deployments = projectId && projectId in deploymentsByProjectId ? deploymentsByProjectId[projectId] : []
  return {
    project,
    deployments,
    isLoading: isLoadingType(getLoading(state), LOAD_PROJECTS_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onDelete: project => dispatch(deleteProject(project)),
  onDuplicate: project => dispatch(duplicateProject(project))
})

export default connect(mapState, mapDispatch)(SceneDetailPage)
