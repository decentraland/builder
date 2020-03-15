import { connect } from 'react-redux'
import { isConnected } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { enableWalletRequest } from 'decentraland-dapps/dist/modules/wallet/actions'

import { RootState } from 'modules/common/types'
import {
  getSideBarCategories,
  getSelectedCategory,
  getSearch,
  getSelectedAssetPack,
  isList,
  showOnlyAssetsWithScripts
} from 'modules/ui/sidebar/selectors'
import { getCollectibleAssets, isLoading as isLoadingAssets } from 'modules/asset/selectors'
import { getSelectedEntityIds } from 'modules/editor/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './ItemDrawer.types'
import ItemDrawer from './ItemDrawer'

const mapState = (state: RootState): MapStateProps => {
  const selectedEntityIds = getSelectedEntityIds(state)

  return {
    categories: getSideBarCategories(state),
    selectedAssetPack: getSelectedAssetPack(state),
    collectibles: getCollectibleAssets(state),
    isLoadingAssets: isLoadingAssets(state),
    selectedCategory: getSelectedCategory(state),
    search: getSearch(state),
    isList: isList(state),
    isConnected: isConnected(state),
    showOnlyAssetsWithScripts: showOnlyAssetsWithScripts(state),
    selectedEntityIds: selectedEntityIds
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onConnect: () => dispatch(enableWalletRequest())
})

export default connect(mapState, mapDispatch)(ItemDrawer)
