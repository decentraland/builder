import { connect } from 'react-redux'

import { RootState, Vector3 } from 'modules/common/types'
import { getCategories } from 'modules/ui/sidebar/selectors'
import { addItem } from 'modules/scene/actions'
import { AssetResource } from 'modules/asset/types'
import { isLoading } from 'modules/assetPack/selectors'
import { searchAssets } from 'modules/ui/sidebar/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './SideBar.types'
import SideBar from './SideBar'

const mapState = (state: RootState): MapStateProps => ({
  categories: getCategories(state),
  isLoading: isLoading(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onAddItem: (asset: AssetResource, position: Vector3) => dispatch(addItem(asset, position)),
  onSearch: search => dispatch(searchAssets(search))
})

export default connect(
  mapState,
  mapDispatch
)(SideBar)
