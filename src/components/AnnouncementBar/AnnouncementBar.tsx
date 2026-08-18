import React, { useCallback } from 'react'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { config } from 'config/index'
import ArrowIcon from './images/arrow.svg'
import CloseIcon from './images/close.svg'
import { Props } from './AnnouncementBar.types'
import styles from './AnnouncementBar.module.css'

// Shared with the marketplace on purpose: both run on the same origin in
// production, so dismissing the bar in one of them dismisses it everywhere.
const ANNOUNCEMENT_BAR_KEY = 'shop-announcement-bar'

export const isAnnouncementBarDismissed = () => localStorage.getItem(ANNOUNCEMENT_BAR_KEY) !== null

const AnnouncementBar = ({ onDismiss }: Props) => {
  const handleDismiss = useCallback(() => {
    localStorage.setItem(ANNOUNCEMENT_BAR_KEY, '1')
    getAnalytics()?.track('Dismiss Shop Announcement Bar')
    onDismiss()
  }, [onDismiss])

  const handleClick = useCallback(() => {
    getAnalytics()?.track('Click Shop Announcement Bar')
  }, [])

  return (
    <aside className={styles.bar}>
      <p className={styles.message}>
        <T
          id="announcement_bar.message"
          values={{ highlight: <span className={styles.highlight}>{t('announcement_bar.highlight')}</span> }}
        />
      </p>
      <a className={styles.cta} href={config.get('SHOP_URL')} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
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
