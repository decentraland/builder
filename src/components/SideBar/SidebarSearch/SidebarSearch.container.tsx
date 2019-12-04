import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getSearch, isSearchDisabled, showOnlyAssetsWithScripts } from 'modules/ui/sidebar/selectors'
import { searchAssets, toggleScripts } from 'modules/ui/sidebar/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './SidebarSearch.types'
import SidebarSearch from './SidebarSearch'

const mapState = (state: RootState): MapStateProps => ({
  search: getSearch(state),
  scripts: showOnlyAssetsWithScripts(state),
  isDisabled: isSearchDisabled(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSearch: search => dispatch(searchAssets(search)),
  onToggleScripts: value => dispatch(toggleScripts(value))
})

export default connect(mapState, mapDispatch)(SidebarSearch)
