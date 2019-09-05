import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { deleteProject, duplicateProject } from 'modules/project/actions'
import { getDeploymentStatus } from 'modules/deployment/selectors'
import { getData as getScenes } from 'modules/scene/selectors'
import { openModal } from 'modules/modal/actions'
import { getLoadingSet, getErrorSet } from 'modules/sync/selectors'

import { MapStateProps, MapDispatch, MapDispatchProps, OwnProps } from './ProjectCard.types'
import ProjectCard from './ProjectCard'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { project } = ownProps
  const scene = getScenes(state)[project.sceneId]
  return {
    items: scene ? scene.metrics.entities : 0,
    deploymentStatus: getDeploymentStatus(state)[ownProps.project.id],
    isUploading: getLoadingSet(state).has(project.id),
    hasError: getErrorSet(state).has(project.id)
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
