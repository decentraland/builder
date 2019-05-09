import { connect } from 'react-redux'
import { isConnected } from 'decentraland-dapps/dist/modules/wallet/selectors'

import { RootState } from 'modules/common/types'
import { getSideBarCategories, getSelectedCategory, getSearch, getSelectedAssetPack, isList } from 'modules/ui/sidebar/selectors'
import { getCollectibleAssets, isLoading as isLoadingAssets } from 'modules/asset/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './ItemDrawer.types'
import ItemDrawer from './ItemDrawer'

const mapState = (state: RootState): MapStateProps => ({
  categories: getSideBarCategories(state),
  selectedAssetPack: getSelectedAssetPack(state),
  collectibles: getCollectibleAssets(state),
  isLoadingAssets: isLoadingAssets(state),
  selectedCategory: getSelectedCategory(state),
  search: getSearch(state),
  isList: isList(state),
  isConnected: isConnected(state)
})

const mapDispatch = (_dispatch: MapDispatch): MapDispatchProps => ({})

export default connect(
  mapState,
  mapDispatch
)(ItemDrawer)
