import * as React from 'react'

import SidebarHeader from '../SidebarHeader'
import SidebarSearch from '../SidebarSearch'
import AssetPackList from '../AssetPackList'
import CategoryList from '../CategoryList'
import AssetList from '../AssetList'
import NoResults from '../NoResults'
import { Props, State } from './ItemDrawer.types'
import './ItemDrawer.css'

export default class ItemDrawer extends React.PureComponent<Props, State> {
  drawerContainer: HTMLElement | null = null

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
    const { search, isList, selectedAssetPack, selectedCategory, categories } = this.props

    const isSearch = search.length > 0

    if (isSearch && categories.length === 0) {
      return <NoResults />
    } else if (!isList && !selectedAssetPack && !isSearch) {
      return <AssetPackList />
    } else if (!isList && !selectedCategory && !isSearch) {
      return <CategoryList />
    } else {
      return categories.map(category => <AssetList category={category} hasLabel={categories.length > 1} />)
    }
  }

  render() {
    return (
      <div className="ItemDrawer">
        <SidebarHeader />
        <SidebarSearch onResetScroll={this.handleResetScroll} />
        <div ref={this.setDrawerContainer} className="overflow-container">
          {this.renderList()}
        </div>
      </div>
    )
  }
}
