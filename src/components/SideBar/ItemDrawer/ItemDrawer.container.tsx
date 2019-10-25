import { connect } from 'react-redux'
import { isConnected } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { connectWalletRequest } from 'decentraland-dapps/dist/modules/wallet/actions'

import { RootState } from 'modules/common/types'
import { getSideBarCategories, getSelectedCategory, getSearch, getSelectedAssetPack, isList } from 'modules/ui/sidebar/selectors'
import { getCollectibleAssets, isLoading as isLoadingAssets } from 'modules/asset/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './ItemDrawer.types'
import ItemDrawer from './ItemDrawer'
import { getSelectedEntityId } from 'modules/editor/selectors'
import { getEntityComponentByType } from 'modules/scene/selectors'
import { ComponentType } from 'modules/scene/types'

const mapState = (state: RootState): MapStateProps => {
  const selectedEntityId = getSelectedEntityId(state)
  const components = selectedEntityId ? getEntityComponentByType(state)[selectedEntityId] : null
  // const scriptComponent = components ? (components[ComponentType.Script] as ComponentDefinition<ComponentType.Script>) : null
  // const selectedAsset = scriptComponent ? getAssets(state)[scriptComponent.data.assetId] : null

  return {
    categories: getSideBarCategories(state),
    selectedAssetPack: getSelectedAssetPack(state),
    collectibles: getCollectibleAssets(state),
    isLoadingAssets: isLoadingAssets(state),
    selectedCategory: getSelectedCategory(state),
    search: getSearch(state),
    isList: isList(state),
    isConnected: isConnected(state),
    hasScript: components ? !!components[ComponentType.Script] : false,
    selectedEntityId
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onConnect: () => dispatch(connectWalletRequest())
})

export default connect(
  mapState,
  mapDispatch
)(ItemDrawer)
