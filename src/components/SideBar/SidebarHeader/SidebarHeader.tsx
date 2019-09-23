import React from 'react'
import { Header, Icon, Button, Popup } from 'decentraland-ui'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Props } from './SidebarHeader.types'
import './SidebarHeader.css'

export default class SidebarHeader extends React.PureComponent<Props> {
  analytics = getAnalytics()

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

  handleEditAssetPack = () => {
    const { selectedAssetPack, onEditAssetPack } = this.props
    if (selectedAssetPack) {
      this.analytics.track('Edit Asset Pack Sidebar Header')
      onEditAssetPack(selectedAssetPack.id)
    }
  }

  handleCreateAssetPack = () => {
    const { onCreateAssetPack } = this.props
    this.analytics.track('Create Asset Pack Sidebar Header')
    onCreateAssetPack()
  }

  render() {
    const { selectedAssetPack, selectedCategory, search, userId } = this.props

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
            <span className="selected-scope">
              <Icon name="chevron left" onClick={this.handleGoBack} />
              <span className="title">
                {selectedCategory || (selectedAssetPack ? selectedAssetPack.title : t('global.loading') + '...')}
              </span>
              <div className="spacer">
                {selectedAssetPack && selectedAssetPack.userId === userId && (
                  <Button basic onClick={this.handleEditAssetPack}>
                    {t('itemdrawer.edit_asset_pack')}
                  </Button>
                )}
              </div>
            </span>
          )}
        </div>
        {isRoot && !isSearch ? (
          <Popup
            className="create-asset-pack-popup"
            content={t('asset_pack.title_create')}
            position="top right"
            on="hover"
            basic
            inverted
            trigger={<div className="create-asset-pack-button" onClick={this.handleCreateAssetPack} />}
          />
        ) : null}
      </Header>
    )
  }
}
