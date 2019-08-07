import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { login } from 'modules/auth/actions'
import { isLoggedIn } from 'modules/auth/selectors'
import { getCurrentProject } from 'modules/project/selectors'
import { MapDispatchProps, MapStateProps } from './QuotaExceededModal.types'
import QuotaExceededModal from './QuotaExceededModal'

const mapState = (state: RootState): MapStateProps => ({
  currentProject: getCurrentProject(state),
  isLoggedIn: isLoggedIn(state)
})

const mapDispatch = (dispatch: Dispatch): MapDispatchProps => ({
  onAuth: () => dispatch(login())
})

export default connect(
  mapState,
  mapDispatch
)(QuotaExceededModal)
