import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './SyncToast.types'
import { getLoadingSet, getErrorSet } from 'modules/sync/selectors'
import { retrySync } from 'modules/sync/actions'
import SyncToast from './SyncToast'

const mapState = (state: RootState): MapStateProps => ({
  syncCount: getLoadingSet(state).size,
  errorCount: getErrorSet(state).size
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onRetry: () => dispatch(retrySync())
})

export default connect(
  mapState,
  mapDispatch
)(SyncToast)
