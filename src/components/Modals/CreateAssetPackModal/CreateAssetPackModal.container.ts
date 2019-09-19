import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { saveAssetPackRequest } from 'modules/assetPack/actions'
import { getProgress, getError } from 'modules/assetPack/selectors'
import { isLoggedIn } from 'modules/auth/selectors'
import { login } from 'modules/auth/actions'
import { getCurrentProject } from 'modules/project/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './CreateAssetPackModal.types'
import CustomLayoutModal from './CreateAssetPackModal'

const mapState = (state: RootState): MapStateProps => ({
  project: getCurrentProject(state),
  progress: getProgress(state),
  error: getError(state),
  isLoggedIn: isLoggedIn(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onCreateAssetPack: (assetPack, contents) => dispatch(saveAssetPackRequest(assetPack, contents)),
  onLogin: options => dispatch(login(options))
})

export default connect(
  mapState,
  mapDispatch
)(CustomLayoutModal)
