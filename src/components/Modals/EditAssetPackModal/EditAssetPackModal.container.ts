import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getSub, isLoggedIn } from 'modules/auth/selectors'
import { saveAssetPackRequest } from 'modules/assetPack/actions'
import { getProgress, getError, getFullAssetPacks } from 'modules/assetPack/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './EditAssetPackModal.types'
import CustomLayoutModal from './EditAssetPackModal'
import { getCurrentProject } from 'modules/project/selectors'
import { login } from 'modules/auth/actions'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => ({
  project: getCurrentProject(state),
  isLoggedIn: isLoggedIn(state),
  progress: getProgress(state),
  error: getError(state),
  userId: getSub(state),
  assetPack: getFullAssetPacks(state)[ownProps.metadata.assetPackId]
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onCreateAssetPack: (assetPack, contents) => dispatch(saveAssetPackRequest(assetPack, contents)),
  onLogin: options => dispatch(login(options))
})

export default connect(
  mapState,
  mapDispatch
)(CustomLayoutModal)
