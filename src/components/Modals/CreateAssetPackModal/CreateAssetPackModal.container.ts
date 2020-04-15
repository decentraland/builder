import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { saveAssetPackRequest } from 'modules/assetPack/actions'
import { getProgress, getError, isLoading } from 'modules/assetPack/selectors'
import { getCurrentProject } from 'modules/project/selectors'
import { getSidebarAssetPacks } from 'modules/ui/sidebar/selectors'
import { isLoggedIn } from 'modules/identity/selectors'
import { loginRequest } from 'modules/identity/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './CreateAssetPackModal.types'
import CustomLayoutModal from './CreateAssetPackModal'

const mapState = (state: RootState): MapStateProps => ({
  project: getCurrentProject(state),
  assetPacks: getSidebarAssetPacks(state),
  progress: getProgress(state),
  ethAddress: getAddress(state),
  error: getError(state),
  isLoggedIn: isLoggedIn(state),
  isLoading: isLoading(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onCreateAssetPack: (assetPack, contents) => dispatch(saveAssetPackRequest(assetPack, contents)),
  onLogin: () => dispatch(loginRequest())
})

export default connect(mapState, mapDispatch)(CustomLayoutModal)
