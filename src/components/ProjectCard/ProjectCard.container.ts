import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { deleteProject, duplicateProject } from 'modules/project/actions'
import { MapStateProps, MapDispatch, MapDispatchProps } from './ProjectCard.types'
import ProjectCard from './ProjectCard'

const mapState = (_: RootState): MapStateProps => ({})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onDeleteProject: id => dispatch(deleteProject(id)),
  onDuplicateProject: id => dispatch(duplicateProject(id))
})

export default connect(
  mapState,
  mapDispatch
)(ProjectCard)
