import React from 'react'
import { env } from 'decentraland-commons'
import { T } from 'decentraland-dapps/dist/modules/translation/utils'

import { NEW_ASSET_PACK_IDS } from 'modules/ui/sidebar/utils'
import SidebarCard from '../SidebarCard'
import { Props } from './AssetPackList.types'
import './AssetPackList.css'

const PROMO_URL = env.get('REACT_APP_PROMO_URL')

export default class AssetPackList extends React.PureComponent<Props> {
  handlePromoClick = () => {
    if (PROMO_URL) {
      window.open(`${PROMO_URL}?utm_source=builder&utm_campaign=catalog`)
    }
  }

  render() {
    const { assetPacks, onSelectAssetPack } = this.props

    return (
      <div className="AssetPackList">
        {
          <div className="promo" onClick={this.handlePromoClick}>
            <div className="icon" />
            <T id="banners.promo_assetpack_banner" />
          </div>
        }
        {assetPacks.map(assetPack => (
          <SidebarCard
            key={assetPack.id}
            id={assetPack.id}
            title={assetPack.title}
            thumbnail={`${assetPack.thumbnail}?updated_at=${assetPack.updatedAt}`}
            onClick={onSelectAssetPack}
            isVisible
            isNew={NEW_ASSET_PACK_IDS.includes(assetPack.id)}
          />
        ))}
      </div>
    )
  }
}
