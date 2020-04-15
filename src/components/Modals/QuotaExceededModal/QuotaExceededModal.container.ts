import { Dispatch } from 'redux'
import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { retrySync } from 'modules/sync/actions'
import { getCurrentProject } from 'modules/project/selectors'
import { getLoadingSet, getErrorSet } from 'modules/sync/selectors'
import { isLoggedIn } from 'modules/identity/selectors'
import { loginRequest } from 'modules/identity/actions'
import { MapDispatchProps, MapStateProps } from './QuotaExceededModal.types'
import QuotaExceededModal from './QuotaExceededModal'

const mapState = (state: RootState): MapStateProps => ({
  errors: getErrorSet(state),
  loading: getLoadingSet(state),
  currentProject: getCurrentProject(state),
  isLoggedIn: isLoggedIn(state)
})

const mapDispatch = (dispatch: Dispatch): MapDispatchProps => ({
  onLogin: () => dispatch(loginRequest()),
  onRetry: () => dispatch(retrySync())
})

export default connect(mapState, mapDispatch)(QuotaExceededModal)
