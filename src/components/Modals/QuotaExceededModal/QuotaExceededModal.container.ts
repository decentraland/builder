import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { retrySync } from 'modules/sync/actions'
import { getCurrentProject } from 'modules/project/selectors'
import { getLoadingSet, getErrorSet } from 'modules/sync/selectors'
import { isLoggedIn, isLoggingIn } from 'modules/identity/selectors'
import { MapDispatchProps, MapStateProps, MapDispatch } from './QuotaExceededModal.types'
import QuotaExceededModal from './QuotaExceededModal'

const mapState = (state: RootState): MapStateProps => ({
  errors: getErrorSet(state),
  loading: getLoadingSet(state),
  currentProject: getCurrentProject(state),
  isLoggingIn: isLoggingIn(state),
  isLoggedIn: isLoggedIn(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onRetry: () => dispatch(retrySync())
})

export default connect(mapState, mapDispatch)(QuotaExceededModal)
