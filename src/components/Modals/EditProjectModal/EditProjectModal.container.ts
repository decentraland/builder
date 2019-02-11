import { connect } from 'react-redux'
import { closeModal } from 'decentraland-dapps/dist/modules/modal/actions'

import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './EditProjectModal.types'
import { getCurrentProject } from 'modules/project/selectors'
import { getCurrentScene } from 'modules/scene/selectors'
import { getGroundAssets } from 'modules/asset/selectors'
import { Project } from 'modules/project/types'
import { Asset } from 'modules/asset/types'
import { editProject } from 'modules/project/actions'
import { setGround } from 'modules/scene/actions'
import EditProjectModal from './EditProjectModal'

const mapState = (state: RootState): MapStateProps => ({
  currentProject: getCurrentProject(state),
  currentScene: getCurrentScene(state),
  grounds: getGroundAssets(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onClose: (name: string) => dispatch(closeModal(name)),
  onSave: (id: string, project: Partial<Project>) => dispatch(editProject(id, project)),
  onSetGround: (project: Project, ground: Asset | null) => dispatch(setGround(project, ground))
})

export default connect(
  mapState,
  mapDispatch
)(EditProjectModal)
