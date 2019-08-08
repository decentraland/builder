import { Dispatch } from 'redux'
import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { login } from 'modules/auth/actions'
import { isLoggedIn } from 'modules/auth/selectors'
import { retrySync } from 'modules/sync/actions'
import { getCurrentProject } from 'modules/project/selectors'
import { getLoadingSet, getErrorSet } from 'modules/sync/selectors'
import { MapDispatchProps, MapStateProps } from './QuotaExceededModal.types'
import QuotaExceededModal from './QuotaExceededModal'

const mapState = (state: RootState): MapStateProps => ({
  errors: getErrorSet(state),
  loading: getLoadingSet(state),
  currentProject: getCurrentProject(state),
  isLoggedIn: isLoggedIn(state)
})

const mapDispatch = (dispatch: Dispatch): MapDispatchProps => ({
  onLogin: () => dispatch(login()),
  onRetry: () => dispatch(retrySync())
})

export default connect(
  mapState,
  mapDispatch
)(QuotaExceededModal)
