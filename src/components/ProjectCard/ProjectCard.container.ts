import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { deleteProject, duplicateProject } from 'modules/project/actions'
import { getSceneById } from 'modules/scene/selectors'
import { openModal } from 'modules/modal/actions'
import { Project } from 'modules/project/types'
import { MapStateProps, MapDispatch, MapDispatchProps } from './ProjectCard.types'
import ProjectCard from './ProjectCard'

const mapState = (state: RootState, { project }: { project: Project }): MapStateProps => {
  const scene = getSceneById(project.sceneId)(state)
  return {
    items: scene ? scene.metrics.entities : 0
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
