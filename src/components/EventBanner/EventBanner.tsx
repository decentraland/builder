import React from 'react'
import { Advertisement, Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Props } from './EventBanner.types'
import './EventBanner.css'

const EventBanner = ({ isMVMFEnabled }: Props) => {
  return isMVMFEnabled ? (
    <Advertisement className="EventBanner" unit="large leaderboard">
      <div className="event-banner-text">
        <span className="title">{t('event_banner.small.title')}</span>
        <span className="subtitle">
          {t('event_banner.small.subtitle', {
            event_category: <b>{t('event_banner.event_category')}</b>,
            event_tag: <b>#{t('event_banner.event_tag')}</b>,
            event_date_deadline: <b>{t('event_banner.event_date_deadline')}</b>,
            enter: <br />
          })}
        </span>
      </div>
      <div className="event-banner-cta">
        <Button
          className="cta"
          size="medium"
          as="a"
          target="_blank"
          rel="noopener noreferrer"
          href="https://events.decentraland.org/event/?id=7148716b-ff25-4d5f-8267-55fed7ab15bc"
        >
          {t('event_banner.small.cta')}
        </Button>
      </div>
    </Advertisement>
  ) : null
}

export default React.memo(EventBanner)
