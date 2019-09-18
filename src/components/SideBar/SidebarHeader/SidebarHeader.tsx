import React from 'react'
import { Header, Icon, Button } from 'decentraland-ui'
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

  handleEditAssetPack = () => {
    const { selectedAssetPack, onEditAssetPack } = this.props
    if (selectedAssetPack) {
      onEditAssetPack(selectedAssetPack.id)
    }
  }

  render() {
    const { selectedAssetPack, selectedCategory, isList, search } = this.props

    const isRoot = selectedAssetPack === null && selectedCategory === null
    const isSearch = search.length > 0

    return (
      <Header className="SidebarHeader" size="medium">
        {isSearch ? (
          <span className="selected-scope">
            <Icon name="chevron left" onClick={this.handleGoBack} />
            <span>{t('itemdrawer.results')}</span>
          </span>
        ) : isRoot ? (
          t('itemdrawer.title')
        ) : (
          <span className="selected-scope">
            <Icon name="chevron left" onClick={this.handleGoBack} />
            <span>{selectedCategory || (selectedAssetPack ? selectedAssetPack.title : t('global.loading') + '...')}</span>
            <Button basic onClick={this.handleEditAssetPack}>
              Edit
            </Button>
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
