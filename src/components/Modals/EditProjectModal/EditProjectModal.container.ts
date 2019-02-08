import { connect } from 'react-redux'
import { closeModal } from 'decentraland-dapps/dist/modules/modal/actions'

import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './EditProjectModal.types'
import { getCurrentProject } from 'modules/project/selectors'
import { Project } from 'modules/project/types'
import { editProject } from 'modules/project/actions'
import EditProjectModal from './EditProjectModal'

const mapState = (state: RootState): MapStateProps => ({
  currentProject: getCurrentProject(state)!
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onClose: (name: string) => dispatch(closeModal(name)),
  onSave: (id: string, project: Partial<Project>) => dispatch(editProject(id, project))
})

export default connect(
  mapState,
  mapDispatch
)(EditProjectModal)
