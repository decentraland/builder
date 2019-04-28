import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getSelectedCategory, getSearch, getSelectedAssetPack } from 'modules/ui/sidebar/selectors'
import { searchAssets } from 'modules/ui/sidebar/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './SidebarSearch.types'
import SidebarSearch from './SidebarSearch'

const mapState = (state: RootState): MapStateProps => ({
  selectedAssetPack: getSelectedAssetPack(state),
  selectedCategory: getSelectedCategory(state),
  search: getSearch(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSearch: search => dispatch(searchAssets(search))
})

export default connect(
  mapState,
  mapDispatch
)(SidebarSearch)
