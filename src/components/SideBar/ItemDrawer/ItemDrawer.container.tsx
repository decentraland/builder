import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getSideBarCategories, getSelectedCategory, getSearch, getSelectedAssetPack, isList } from 'modules/ui/sidebar/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './ItemDrawer.types'
import ItemDrawer from './ItemDrawer'

const mapState = (state: RootState): MapStateProps => ({
  categories: getSideBarCategories(state),
  selectedAssetPack: getSelectedAssetPack(state),
  selectedCategory: getSelectedCategory(state),
  search: getSearch(state),
  isList: isList(state)
})

const mapDispatch = (_dispatch: MapDispatch): MapDispatchProps => ({})

export default connect(
  mapState,
  mapDispatch
)(ItemDrawer)
