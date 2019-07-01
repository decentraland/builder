import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { deleteProject, duplicateProject } from 'modules/project/actions'
import { getSceneById } from 'modules/scene/selectors'
import { openModal } from 'modules/modal/actions'

import { MapStateProps, MapDispatch, MapDispatchProps, OwnProps } from './ProjectCard.types'
import ProjectCard from './ProjectCard'
import { getDeploymentStatus } from 'modules/deployment/selectors'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { project } = ownProps
  const scene = getSceneById(project.sceneId)(state)
  return {
    items: scene ? scene.metrics.entities : 0,
    deploymentStatus: getDeploymentStatus(ownProps.project.id)(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onDeleteProject: id => dispatch(deleteProject(id)),
  onDuplicateProject: id => dispatch(duplicateProject(id)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata))
})

export default connect(
  mapState,
  mapDispatch
)(ProjectCard)
