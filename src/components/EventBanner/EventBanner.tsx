import React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Props } from './EventBanner.types'
import './EventBanner.css'

const EventBanner = ({ isCampaignEnabled }: Props) => {
  return isCampaignEnabled ? (
    <div className="EventBanner">
      <div className="event-banner-text">
        <span className="title">{t('event_banner.small.title')}</span>
        <span className="subtitle">
          {t('event_banner.small.subtitle', {
            event_tag: <b>#{t('event_banner.event_tag')}</b>,
            enter: <br />
          })}
        </span>
      </div>
    </div>
  ) : null
}

export default React.memo(EventBanner)
