import { connect } from 'react-redux'

import { RootDispatch } from 'modules/common/types'
import { loadAssetPacksRequest, LoadAssetPacksRequestAction } from 'modules/assetPack/actions'
import { MapDispatchProps } from './EditorPage.types'
import EditorPage from './EditorPage'

const mapState = () => ({})

const mapDispatch = (dispatch: RootDispatch<LoadAssetPacksRequestAction>): MapDispatchProps => ({
  onLoadAssetPacks: () => dispatch(loadAssetPacksRequest())
})

export default connect(
  mapState,
  mapDispatch
)(EditorPage)
