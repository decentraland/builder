import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getLoadingSet, getErrorSet } from 'modules/sync/selectors'
import { retrySync } from 'modules/sync/actions'
import { didDismissSignInToast, didDismissSyncedToast, getProjects } from 'modules/ui/dashboard/selectors'
import { dismissSignInToast, dismissSyncedToast } from 'modules/ui/dashboard/actions'
import { isLoggedIn } from 'modules/identity/selectors'
import { openModal } from 'modules/modal/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './SyncToast.types'
import SyncToast from './SyncToast'

const mapState = (state: RootState): MapStateProps => ({
  syncCount: getLoadingSet(state).size,
  errorCount: getErrorSet(state).size,
  projectCount: getProjects(state).length,
  isLoggedIn: isLoggedIn(state),
  didDismissSignInToast: didDismissSignInToast(state),
  didDismissSyncedToast: didDismissSyncedToast(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onRetry: () => dispatch(retrySync()),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onDismissSignInToast: () => dispatch(dismissSignInToast()),
  onDismissSyncedToast: () => dispatch(dismissSyncedToast())
})

export default connect(mapState, mapDispatch)(SyncToast)
