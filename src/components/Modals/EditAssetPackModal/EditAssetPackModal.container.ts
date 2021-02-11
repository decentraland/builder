import { connect } from 'react-redux'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { saveAssetPackRequest, deleteAssetPackRequest } from 'modules/assetPack/actions'
import { getProgress, getError, getFullAssetPacks, isLoading } from 'modules/assetPack/selectors'
import { getCurrentProject } from 'modules/project/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './EditAssetPackModal.types'
import CustomLayoutModal from './EditAssetPackModal'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => ({
  project: getCurrentProject(state),
  isLoading: isLoading(state),
  progress: getProgress(state),
  error: getError(state),
  ethAddress: getAddress(state),
  assetPack: getFullAssetPacks(state)[ownProps.metadata.assetPackId]
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onCreateAssetPack: (assetPack, contents) => dispatch(saveAssetPackRequest(assetPack, contents)),
  onDeleteAssetPack: assetPack => dispatch(deleteAssetPackRequest(assetPack))
})

export default connect(mapState, mapDispatch)(CustomLayoutModal)
