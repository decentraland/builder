import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { hasSubmittedProject } from 'modules/contest/selectors'
import { deleteProject, duplicateProject } from 'modules/project/actions'
import { getSceneById } from 'modules/scene/selectors'
import { Project } from 'modules/project/types'
import { MapStateProps, MapDispatch, MapDispatchProps } from './ProjectCard.types'
import ProjectCard from './ProjectCard'

const mapState = (state: RootState, { project }: { project: Project }): MapStateProps => {
  const scene = getSceneById(project.sceneId)(state)
  return {
    hasSubmittedProject: hasSubmittedProject(state, project.id),
    items: scene ? scene.metrics.entities : 0
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onDeleteProject: id => dispatch(deleteProject(id)),
  onDuplicateProject: id => dispatch(duplicateProject(id))
})

export default connect(
  mapState,
  mapDispatch
)(ProjectCard)
