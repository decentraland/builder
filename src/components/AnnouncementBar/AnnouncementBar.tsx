import React, { useCallback, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { config } from 'config'
import ArrowIcon from './images/arrow.svg'
import CloseIcon from './images/close.svg'
import { Props } from './AnnouncementBar.types'
import styles from './AnnouncementBar.module.css'

// Shared with the marketplace on purpose: both run on the same origin in
// production, so dismissing the bar in one of them dismisses it everywhere.
const ANNOUNCEMENT_BAR_KEY = 'shop-announcement-bar'
const ANNOUNCEMENT_BAR_SOURCE = 'builder'

export const CLICK_SHOP_ANNOUNCEMENT_BAR = 'Click Shop Announcement Bar'
export const DISMISS_SHOP_ANNOUNCEMENT_BAR = 'Dismiss Shop Announcement Bar'

export const isAnnouncementBarDismissed = () => localStorage.getItem(ANNOUNCEMENT_BAR_KEY) !== null

const AnnouncementBar = ({ onDismiss }: Props) => {
  const { pathname } = useLocation()

  // The campaign params let the shop attribute what these visitors do after they
  // land, which the click event alone cannot tell us. Without them a click from
  // here arrives at the shop as untagged traffic, indistinguishable from someone
  // who found it on their own — the marketplace bar tags its link the same way,
  // and `utm_source` is what tells the two bars apart once they are there.
  const shopUrl = useMemo(() => {
    const url = new URL(config.get('SHOP_URL'))
    url.searchParams.set('utm_source', ANNOUNCEMENT_BAR_SOURCE)
    url.searchParams.set('utm_medium', 'announcement_bar')
    url.searchParams.set('utm_campaign', 'shop_launch')
    return url.toString()
  }, [])

  const handleDismiss = useCallback(() => {
    localStorage.setItem(ANNOUNCEMENT_BAR_KEY, '1')
    getAnalytics()?.track(DISMISS_SHOP_ANNOUNCEMENT_BAR, { source: ANNOUNCEMENT_BAR_SOURCE, path: pathname })
    onDismiss()
  }, [onDismiss, pathname])

  const handleClick = useCallback(() => {
    getAnalytics()?.track(CLICK_SHOP_ANNOUNCEMENT_BAR, { source: ANNOUNCEMENT_BAR_SOURCE, path: pathname })
  }, [pathname])

  return (
    <aside className={styles.bar}>
      <p className={styles.message}>
        <T
          id="announcement_bar.message"
          values={{ highlight: <span className={styles.highlight}>{t('announcement_bar.highlight')}</span> }}
        />
      </p>
      <a className={styles.cta} href={shopUrl} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
        <span className={styles.ctaLabel}>{t('announcement_bar.cta')}</span>
        <span className={styles.ctaIcon}>
          <img src={ArrowIcon} alt="" />
        </span>
      </a>
      <button type="button" className={styles.close} onClick={handleDismiss} aria-label={t('announcement_bar.dismiss')}>
        <img src={CloseIcon} alt="" />
      </button>
    </aside>
  )
}

export default React.memo(AnnouncementBar)
