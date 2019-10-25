import * as React from 'react'
import { Loader } from 'decentraland-ui'

import { T } from 'decentraland-dapps/dist/modules/translation/utils'
import { COLLECTIBLE_ASSET_PACK_ID } from 'modules/ui/sidebar/utils'
import SidebarHeader from '../SidebarHeader'
import SidebarSearch from '../SidebarSearch'
import AssetPackList from '../AssetPackList'
import CategoryList from '../CategoryList'
import AssetList from '../AssetList'
import NoResults from '../NoResults'
import WalletSignIn from '../WalletSignIn'
import EntityEditor from '../EntityEditor'
import { Props, State } from './ItemDrawer.types'
import './ItemDrawer.css'

export default class ItemDrawer extends React.PureComponent<Props, State> {
  drawerContainer: HTMLElement | null = null

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.selectedAssetPack !== nextProps.selectedAssetPack && !nextProps.isConnected && this.isViewingCollectibles(nextProps)) {
      this.props.onConnect()
    }
  }

  handleResetScroll() {
    if (this.drawerContainer) {
      this.drawerContainer.scrollTop = 0
    }
  }

  setDrawerContainer = (ref: HTMLElement | null) => {
    if (!this.drawerContainer) {
      this.drawerContainer = ref
    }
  }

  renderList() {
    const {
      search,
      isList,
      selectedAssetPack,
      selectedCategory,
      categories,
      isConnected,
      isLoadingAssets,
      hasScript,
      selectedEntityId
    } = this.props

    const isSearch = search.length > 0
    const isCollectibleAssetPackSelected = selectedAssetPack && selectedAssetPack.id === COLLECTIBLE_ASSET_PACK_ID

    if (hasScript) {
      return <EntityEditor entityId={selectedEntityId!} />
    } else if (isCollectibleAssetPackSelected && isLoadingAssets) {
      return <Loader active size="massive" />
    } else if (isCollectibleAssetPackSelected && !isConnected) {
      return <WalletSignIn />
    } else if (categories.length === 0) {
      return <NoResults />
    } else if (!isList && !selectedAssetPack && !isSearch) {
      return <AssetPackList />
    } else if (!isList && !selectedCategory && !isSearch && categories.length > 1) {
      return <CategoryList />
    } else {
      return categories.map(category => <AssetList key={category.name} category={category} hasLabel={categories.length > 1} />)
    }
  }

  isViewingCollectibles(props = this.props) {
    const { search, selectedAssetPack, isLoadingAssets } = props
    return selectedAssetPack && selectedAssetPack.id === COLLECTIBLE_ASSET_PACK_ID && !isLoadingAssets && !search
  }

  render() {
    const { isConnected, hasScript } = this.props
    return (
      <div className="ItemDrawer">
        {!hasScript && (
          <>
            <SidebarHeader />
            <SidebarSearch onResetScroll={this.handleResetScroll} />
          </>
        )}

        <div ref={this.setDrawerContainer} className="overflow-container">
          {this.renderList()}
          {this.isViewingCollectibles() && isConnected && (
            <span className="disclaimer">
              <T id={`itemdrawer.collectible_disclaimer`} values={{ br: <br /> }} />
            </span>
          )}
        </div>
      </div>
    )
  }
}
