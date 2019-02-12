import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { Project } from 'modules/project/types'
import { getCurrentProject } from 'modules/project/selectors'
import { editProject } from 'modules/project/actions'
import { closeModal } from 'modules/modal/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './EditProjectModal.types'
import EditProjectModal from './EditProjectModal'

const mapState = (state: RootState): MapStateProps => ({
  currentProject: getCurrentProject(state)!
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSave: (id: string, project: Partial<Project>) => dispatch(editProject(id, project)),
  onClose: name => dispatch(closeModal(name))
})

export default connect(
  mapState,
  mapDispatch
)(EditProjectModal)
