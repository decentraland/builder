import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getSideBarCategories } from 'modules/ui/sidebar/selectors'
import { addItem } from 'modules/scene/actions'
import { isLoading } from 'modules/assetPack/selectors'
import { searchAssets } from 'modules/ui/sidebar/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './SideBar.types'
import SideBar from './SideBar'

const mapState = (state: RootState): MapStateProps => ({
  categories: getSideBarCategories(state),
  isLoading: isLoading(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onAddItem: asset => dispatch(addItem(asset)),
  onSearch: search => dispatch(searchAssets(search))
})

export default connect(
  mapState,
  mapDispatch
)(SideBar)
