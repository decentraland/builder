import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { saveAssetPackRequest } from 'modules/assetPack/actions'
import { getProgress } from 'modules/assetPack/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './CreateAssetPackModal.types'
import CustomLayoutModal from './CreateAssetPackModal'

const mapState = (state: RootState): MapStateProps => ({
  progress: getProgress(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onCreateAssetPack: (assetPack, contents) => dispatch(saveAssetPackRequest(assetPack, contents))
})

export default connect(
  mapState,
  mapDispatch
)(CustomLayoutModal)
