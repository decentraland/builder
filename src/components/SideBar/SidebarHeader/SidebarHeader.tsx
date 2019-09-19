import React from 'react'
import { Header, Icon } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { SidebarView } from 'modules/ui/sidebar/types'
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
    const { selectedAssetPack, selectedCategory, search, onCreateAssetPack } = this.props

    const isRoot = selectedAssetPack === null && selectedCategory === null
    const isSearch = search.length > 0

    return (
      <Header className="SidebarHeader" size="medium">
        <div className="title">
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
              {selectedCategory || (selectedAssetPack ? selectedAssetPack.title : t('global.loading') + '...')}
            </span>
          )}
        </div>
        {isRoot && !isSearch ? <div className="create-asset-pack-button" onClick={onCreateAssetPack} /> : null}
      </Header>
    )
  }
}
