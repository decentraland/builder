import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getCurrentProject } from 'modules/project/selectors'
import { registerEmail } from 'modules/contest/actions'
import { closeModal } from 'modules/modal/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './ContestModal.types'
import ContestModal from './ContestModal'

const mapState = (state: RootState): MapStateProps => ({
  currentProject: getCurrentProject(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onRegisterEmail: (email: string, projectId: string) => dispatch(registerEmail(email, projectId)),
  onClose: name => dispatch(closeModal(name))
})

export default connect(
  mapState,
  mapDispatch
)(ContestModal)
