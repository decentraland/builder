import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'

import { getCurrentProject } from 'modules/project/selectors'
import { getCurrentScene } from 'modules/scene/selectors'
import { editProject } from 'modules/project/actions'

import { MapStateProps, MapDispatchProps, MapDispatch } from './EditProjectModal.types'
import EditProjectModal from './EditProjectModal'
import { getCurrentDeploymentStatus } from 'modules/deployment/selectors'

// Both the current project and scenes are always present when this modal is rendered
const mapState = (state: RootState): MapStateProps => ({
  currentProject: getCurrentProject(state)!,
  currentScene: getCurrentScene(state)!,
  deploymentStatus: getCurrentDeploymentStatus(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSave: (id, project) => dispatch(editProject(id, project))
})

export default connect(mapState, mapDispatch)(EditProjectModal)
