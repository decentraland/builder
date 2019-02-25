import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getSideBarCategories, getSidebarView, getSelectedCategory, getSearch } from 'modules/ui/sidebar/selectors'
import { addItem, setGround } from 'modules/scene/actions'
import { isLoading } from 'modules/assetPack/selectors'
import { searchAssets, setSidebarView, selectCategory } from 'modules/ui/sidebar/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './ItemDrawer.types'
import ItemDrawer from './ItemDrawer'
import { getCurrentProject } from 'modules/project/selectors'

const mapState = (state: RootState): MapStateProps => ({
  categories: getSideBarCategories(state),
  selectedCategory: getSelectedCategory(state),
  view: getSidebarView(state),
  search: getSearch(state),
  isLoading: isLoading(state),
  project: getCurrentProject(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onAddItem: asset => dispatch(addItem(asset)),
  onSearch: search => dispatch(searchAssets(search)),
  onSetSidebarView: view => dispatch(setSidebarView(view)),
  onSelectCategory: category => dispatch(selectCategory(category)),
  onSetGround: (project, ground) => dispatch(setGround(project, ground))
})

export default connect(
  mapState,
  mapDispatch
)(ItemDrawer)
