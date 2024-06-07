import { useEffect } from 'react'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'

import './UnsupportedBrowserPage.css'

export default function UnsupportedBrowserPage() {
  useEffect(() => {
    const analytics = getAnalytics()
    document.body.classList.add('notfound-body')
    analytics.track('Not found page', {})
    return () => {
      document.body.classList.remove('notfound-body')
    }
  }, [])
  return (
    <div className="UnsupportedBrowserPage">
      <h1 className="title">{t('unsupported_browser_page.title')}</h1>
      <p className="subtitle">
        <T
          id="unsupported_browser_page.subtitle"
          values={{
            br: <br />,
            chrome: <a href="https://www.google.com/chrome/">Google Chrome</a>,
            firefox: <a href="https://www.google.com/chrome/">Mozilla Firefox</a>
          }}
        />
      </p>
    </div>
  )
}
