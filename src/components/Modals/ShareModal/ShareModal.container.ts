import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, OwnProps } from './ShareModal.types'
import { getCurrentProject } from 'modules/project/selectors'
import { isReady, isLoading, isScreenshotReady } from 'modules/editor/selectors'
import { shareProject } from 'modules/project/actions'
import { shareScene } from 'modules/ui/share/actions'
import { ShareTarget } from 'modules/ui/share/types'
import { isLoggedIn } from 'modules/identity/selectors'
import { loginRequest } from 'modules/identity/actions'
import { getIsAuthDappEnabled } from 'modules/features/selectors'
import ShareModal from './ShareModal'

const mapState = (state: RootState, _ownProps: OwnProps): MapStateProps => ({
  project: getCurrentProject(state)!,
  isLoading: !isReady(state) || isLoading(state),
  isScreenshotReady: isScreenshotReady(state),
  isLoggedIn: isLoggedIn(state),
  isAuthDappEnabled: getIsAuthDappEnabled(state)
})

const mapDispatch = (dispatch: Dispatch): MapDispatchProps => ({
  onUpdate: (id: string) => dispatch(shareProject(id)),
  onLogin: providerType => dispatch(loginRequest(providerType)),
  onShare: (target: ShareTarget) => dispatch(shareScene(target))
})

export default connect(mapState, mapDispatch)(ShareModal)
