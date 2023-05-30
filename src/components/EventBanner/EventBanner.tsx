import React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Props } from './EventBanner.types'
import logo from './pride-logo.png'
import hat from './pride_hat.png'
import './EventBanner.css'

const EventBanner = ({ isCampaignEnabled }: Props) => {
  return isCampaignEnabled ? (
    <div className="EventBanner">
      <div className="event-banner-text event-banner-logo-container">
        <span className="subtitle">{t('event_banner.small.dates')}</span>
        <img src={logo} alt={t('event_banner.event_tag')} className="event-banner-logo" />
        <span>{t('event_banner.small.information')}</span>
      </div>
      <div className="event-banner-text">
        <span className="title">{t('event_banner.small.title')}</span>
        <span className="subtitle">
          {t('event_banner.small.subtitle', {
            event_tag: <b className="event-banner-pink">'{t('event_banner.event_tag')}'</b>,
            enter: <br />
          })}
        </span>
      </div>
      <img src={hat} alt={t('event_banner.event_tag')} className="event-banner-hat" />
    </div>
  ) : null
}

export default React.memo(EventBanner)
