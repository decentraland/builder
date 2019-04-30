import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getSelectedCategory, getSelectedAssetPack, isList, getSearch } from 'modules/ui/sidebar/selectors'
import { setSidebarView, selectCategory, selectAssetPack, searchAssets } from 'modules/ui/sidebar/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './SidebarHeader.types'
import SidebarHeader from './SidebarHeader'

const mapState = (state: RootState): MapStateProps => ({
  selectedAssetPack: getSelectedAssetPack(state),
  selectedCategory: getSelectedCategory(state),
  isList: isList(state),
  search: getSearch(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetSidebarView: view => dispatch(setSidebarView(view)),
  onSelectCategory: category => dispatch(selectCategory(category)),
  onSelectAssetPack: assetPackId => dispatch(selectAssetPack(assetPackId)),
  onSearch: search => dispatch(searchAssets(search))
})

export default connect(
  mapState,
  mapDispatch
)(SidebarHeader)
