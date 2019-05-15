import React from 'react'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { Campaign } from 'modules/analytics/campaigns'

import SidebarCard from '../SidebarCard'
import { Props } from './AssetPackList.types'
import './AssetPackList.css'

export default class AssetPackList extends React.PureComponent<Props> {
  handlePromoClick = () => {
    const analytics = getAnalytics()
    analytics.track('Item catalog Dapper CTA', {
      campaign: Campaign.DAPPER
    })
    window.open('https://dap.pr/dclinstallp')
  }

  render() {
    const { assetPacks, onSelectAssetPack } = this.props

    return (
      <div className="AssetPackList">
        <div className="promo" onClick={this.handlePromoClick}>
          <div className="icon" />
          <T
            id="banners.dapper_assetpack_banner"
            values={{
              cat: <span className="highlight">{t('banners.dapper_homepage_cta')}</span>
            }}
          />
        </div>
        {assetPacks.map(assetPack => (
          <SidebarCard
            key={assetPack.id}
            id={assetPack.id}
            title={assetPack.title}
            thumbnail={assetPack.thumbnail}
            onClick={onSelectAssetPack}
            isVisible
          />
        ))}
      </div>
    )
  }
}
