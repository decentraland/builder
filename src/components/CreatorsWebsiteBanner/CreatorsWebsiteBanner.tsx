import React, { useCallback } from 'react'
import { sleep } from 'decentraland-dapps/dist/lib/time'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Button } from 'decentraland-ui2'
import styles from './CreatorsWebsiteBanner.module.css'

const CREATORS_WEBSITE_URL = 'https://decentraland.org/create/collections'

// Hardcoded rather than a Contentful banner: it announces a one-off move, so it needs no campaign entry,
// and its artwork leaves the left of the frame empty for exactly this copy.
const CreatorsWebsiteBanner = () => {
  // The same event, under the same location, as the Contentful banner this replaces, so its click count
  // carries on in the same series.
  const handleClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    // A modified click opens a new tab, and this page stays put, so there is nothing to wait for.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    try {
      getAnalytics()?.track('CLICK_BANNER', { id: 'creators-website', location: 'builderCampaignBanner' })
    } catch {
      // The default was already prevented, so a failing tracker must not leave the click going nowhere.
    }
    // Leaving straight away would drop the event before it is sent.
    void sleep(300).then(() => {
      window.location.href = CREATORS_WEBSITE_URL
    })
  }, [])

  return (
    <a className={styles.banner} href={CREATORS_WEBSITE_URL} onClick={handleClick}>
      <div className={styles.copy}>
        <h2 className={styles.title}>{t('creators_website_banner.title', { br: <br /> })}</h2>
        <p className={styles.text}>{t('creators_website_banner.text', { br: <br /> })}</p>
        {/* Only the look of a button: the whole banner is already the link, and a link cannot hold another
            control, so this is a span kept out of the tab order and the accessibility tree. */}
        <Button className={styles.cta} component="span" variant="contained" disableElevation tabIndex={-1} aria-hidden="true">
          {t('creators_website_banner.cta')}
        </Button>
      </div>
    </a>
  )
}

export default React.memo(CreatorsWebsiteBanner)
