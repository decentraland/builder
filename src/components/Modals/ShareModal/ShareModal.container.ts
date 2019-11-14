import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, OwnProps } from './ShareModal.types'
import ShareModal from './ShareModal'
import { getCurrentProject } from 'modules/project/selectors'
import { isReady, isLoading, isScreenshotReady } from 'modules/editor/selectors'
import { shareProject } from 'modules/project/actions'
import { isLoggedIn } from 'modules/auth/selectors'
import { login } from 'modules/auth/actions'

const mapState = (state: RootState, _ownProps: OwnProps): MapStateProps => ({
  project: getCurrentProject(state)!,
  isLoading: !isReady(state) || isLoading(state),
  isScreenshotReady: isScreenshotReady(state),
  isLoggedIn: isLoggedIn(state)
})

const mapDispatch = (dispatch: Dispatch): MapDispatchProps => ({
  onUpdate: (id: string) => dispatch(shareProject(id)),
  onLogin: () => dispatch(login())
})

export default connect(
  mapState,
  mapDispatch
)(ShareModal)
