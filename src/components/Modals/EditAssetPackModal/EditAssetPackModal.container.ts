import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { saveAssetPackRequest } from 'modules/assetPack/actions'
import { getProgress, getError, getFullAssetPacks } from 'modules/assetPack/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './EditAssetPackModal.types'
import CustomLayoutModal from './EditAssetPackModal'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => ({
  progress: getProgress(state),
  error: getError(state),
  assetPack: getFullAssetPacks(state)[ownProps.metadata.assetPackId]
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onCreateAssetPack: (assetPack, contents) => dispatch(saveAssetPackRequest(assetPack, contents))
})

export default connect(
  mapState,
  mapDispatch
)(CustomLayoutModal)
