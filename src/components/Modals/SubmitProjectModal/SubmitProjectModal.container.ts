import { connect } from 'react-redux'
import { closeModal } from 'decentraland-dapps/dist/modules/modal/actions'

import { RootState } from 'modules/common/types'
import { UserContest } from 'modules/contest/types'
import { Project } from 'modules/project/types'
import { getData as getContest } from 'modules/contest/selectors'
import { getCurrentProject } from 'modules/project/selectors'
import { editProject } from 'modules/project/actions'
import { submitProjectRequest } from 'modules/contest/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './SubmitProjectModal.types'
import SubmitProjectModal from './SubmitProjectModal'

const mapState = (state: RootState): MapStateProps => ({
  currentProject: getCurrentProject(state),
  contest: getContest(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSaveProject: (id: string, project: Partial<Project>) => dispatch(editProject(id, project)),
  onSubmitProject: (projectId: string, contest: UserContest) => dispatch(submitProjectRequest(projectId, contest)),
  onClose: (name: string) => dispatch(closeModal(name))
})

export default connect(
  mapState,
  mapDispatch
)(SubmitProjectModal)
