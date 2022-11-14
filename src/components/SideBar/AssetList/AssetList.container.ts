import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { isList } from 'modules/ui/sidebar/selectors'
import { addItem, setGround } from 'modules/scene/actions'
import { getCurrentProject } from 'modules/project/selectors'
import { prefetchAsset } from 'modules/editor/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './AssetList.types'
import AssetList from './AssetList'

const mapState = (state: RootState): MapStateProps => ({
  isList: isList(state),
  currentProject: getCurrentProject(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onAddItem: asset => dispatch(addItem(asset)),
  onSetGround: (projectId, ground) => dispatch(setGround(projectId, ground)),
  onPrefetchAsset: asset => dispatch(prefetchAsset(asset))
})

export default connect(mapState, mapDispatch)(AssetList)
