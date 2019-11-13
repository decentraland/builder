import React from 'react'
import { env } from 'decentraland-commons'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'

import { NEW_ASSET_PACK_IDS } from 'modules/ui/sidebar/utils'
import SidebarCard from '../SidebarCard'
import { Props } from './AssetPackList.types'
import './AssetPackList.css'
import Icon from 'components/Icon'

const PROMO_URL = env.get('REACT_APP_PROMO_URL')

export default class AssetPackList extends React.PureComponent<Props> {
  analytics = getAnalytics()

  handlePromoClick = () => {
    if (PROMO_URL) {
      window.open(`${PROMO_URL}?utm_source=builder&utm_campaign=catalog`)
    }
  }

  handleCreateAssetPack = () => {
    const { onOpenModal } = this.props
    this.analytics.track('Create Asset Pack Sidebar Bottom')
    onOpenModal('CreateAssetPackModal')
  }

  render() {
    const { assetPacks, onSelectAssetPack } = this.props

    return (
      <div className="AssetPackList">
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
        <div onClick={this.handleCreateAssetPack}>
          <Icon name="add" /> {t('asset_pack.new_asset_pack')}
        </div>
      </div>
    )
  }
}
