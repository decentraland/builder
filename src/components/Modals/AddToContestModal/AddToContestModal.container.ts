import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { UserContest } from 'modules/contest/types'
import { Project } from 'modules/project/types'
import { getData as getContest, isLoading, getError } from 'modules/contest/selectors'
import { getCurrentProject } from 'modules/project/selectors'
import { editProjectRequest } from 'modules/project/actions'
import { submitProjectRequest } from 'modules/contest/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './AddToContestModal.types'
import AddToContestModal from './AddToContestModal'

const mapState = (state: RootState): MapStateProps => ({
  currentProject: getCurrentProject(state),
  contest: getContest(state),
  isLoading: isLoading(state),
  error: getError(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSaveProject: (id: string, project: Partial<Project>) => dispatch(editProjectRequest(id, project)),
  onSubmitProject: (projectId: string, contest: UserContest) => dispatch(submitProjectRequest(projectId, contest))
})

export default connect(
  mapState,
  mapDispatch
)(AddToContestModal)
