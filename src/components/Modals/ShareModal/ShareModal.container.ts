import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
// import { getData as getDeployments } from 'modules/deployment/selectors'
import { MapStateProps, MapDispatchProps, OwnProps } from './ShareModal.types'
import ShareModal from './ShareModal'
import { getCurrentProject } from 'modules/project/selectors'
import { isLoading } from 'modules/assetPack/selectors'
import { isReady } from 'modules/editor/selectors'
import { editProject } from 'modules/project/actions'
import { isLoggedIn } from 'modules/auth/selectors'
import { login } from 'modules/auth/actions'
import { share } from 'modules/ui/share/actions'
import { ShareTarget } from 'modules/ui/share/types'

const mapState = (state: RootState, _ownProps: OwnProps): MapStateProps => ({
  project: getCurrentProject(state)!,
  isLoading: !isReady(state) || isLoading(state),
  isLoggedIn: isLoggedIn(state)
})

const mapDispatch = (dispatch: Dispatch): MapDispatchProps => ({
  onSave: (id: string, project: any) => dispatch(editProject(id, project)),
  onLogin: () => dispatch(login()),
  onShare: (target: ShareTarget) => dispatch(share(target))
})

export default connect(
  mapState,
  mapDispatch
)(ShareModal)
