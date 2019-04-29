import React from 'react'
import { Header, Icon } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { SidebarView } from 'modules/ui/sidebar/types'
import Chip from 'components/Chip'
import { Props } from './SidebarHeader.types'

import './SidebarHeader.css'

export default class SidebarHeader extends React.PureComponent<Props> {
  handleGoBack = () => {
    const { selectedAssetPack, selectedCategory, onSelectAssetPack, onSelectCategory, search, onSearch } = this.props
    if (search) {
      onSearch('')
    } else if (selectedCategory !== null) {
      onSelectCategory(null)
    } else if (selectedAssetPack !== null) {
      onSelectAssetPack(null)
    }
  }

  handleSetGridView = () => {
    this.props.onSetSidebarView(SidebarView.GRID)
  }

  handleSetListView = () => {
    this.props.onSetSidebarView(SidebarView.LIST)
  }

  render() {
    const { selectedAssetPack, selectedCategory, isList, search } = this.props

    const isRoot = selectedAssetPack === null && selectedCategory === null
    const isSearch = search.length > 0

    return (
      <Header className="SidebarHeader" size="medium">
        {isSearch ? (
          <span className="selected-scope" onClick={this.handleGoBack}>
            <Icon name="chevron left" />
            {t('itemdrawer.results')}
          </span>
        ) : isRoot ? (
          t('itemdrawer.title')
        ) : (
          <span className="selected-scope" onClick={this.handleGoBack}>
            <Icon name="chevron left" />
            {selectedCategory ? selectedCategory : selectedAssetPack ? selectedAssetPack.title : t('global.loading') + '...'}
          </span>
        )}
        {isRoot && !isSearch ? (
          <div className="item-drawer-type-buttons">
            <Chip icon="grid" isActive={!isList} onClick={this.handleSetGridView} />
            <Chip icon="list" isActive={isList} onClick={this.handleSetListView} />
          </div>
        ) : null}
      </Header>
    )
  }
}
