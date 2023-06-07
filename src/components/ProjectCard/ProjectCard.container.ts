import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { deleteProject, duplicateProject, loadProjectSceneRequest } from 'modules/project/actions'
import { getDeploymentStatusByProjectId, getDeploymentsByProjectId } from 'modules/deployment/selectors'
import { getData as getScenes } from 'modules/scene/selectors'
import { getData as getPoolProjects } from 'modules/pool/selectors'
import { openModal } from 'modules/modal/actions'
import { getLoadingSet, getErrorSet } from 'modules/sync/selectors'
import { PreviewType } from 'modules/editor/types'

import { MapStateProps, MapDispatch, MapDispatchProps, OwnProps } from './ProjectCard.types'
import ProjectCard from './ProjectCard'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { project } = ownProps
  const parcels = project.layout.cols * project.layout.rows
  const scene = getScenes(state)[project.sceneId]
  const items = scene ? Object.keys(scene.entities).length - parcels : 0
  const type = getPoolProjects(state)[project.id] ? PreviewType.POOL : PreviewType.PROJECT

  return {
    parcels,
    items,
    deploymentStatus: getDeploymentStatusByProjectId(state)[ownProps.project.id],
    deployments: getDeploymentsByProjectId(state)[ownProps.project.id],
    isUploading: getLoadingSet(state).has(project.id),
    hasError: getErrorSet(state).has(project.id),
    type
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onDeleteProject: id => dispatch(deleteProject(id)),
  onDuplicateProject: id => dispatch(duplicateProject(id)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onLoadProjectScene: (project, type) => dispatch(loadProjectSceneRequest(project, type))
})

export default connect(mapState, mapDispatch)(ProjectCard)
