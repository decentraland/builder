import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { hasSubmittedProject } from 'modules/contest/selectors'
import { deleteProject, duplicateProject } from 'modules/project/actions'
import { MapStateProps, MapDispatch, MapDispatchProps } from './ProjectCard.types'
import ProjectCard from './ProjectCard'
import { Project } from 'modules/project/types'

const mapState = (state: RootState, { project }: { project: Project }): MapStateProps => ({
  hasSubmittedProject: hasSubmittedProject(state, project.id)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onDeleteProject: id => dispatch(deleteProject(id)),
  onDuplicateProject: id => dispatch(duplicateProject(id))
})

export default connect(
  mapState,
  mapDispatch
)(ProjectCard)
