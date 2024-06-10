import { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { Button, Page } from 'decentraland-ui'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import Footer from 'components/Footer'
import Navbar from 'components/Navbar'
import LoadingPage from 'components/LoadingPage'

import './NotFoundPage.css'

export default function NotFoundPage() {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const history = useHistory()

  useEffect(() => {
    const analytics = getAnalytics()
    analytics.track('Not found page', {})

    setIsLoading(false)
  }, [])

  function handleClick() {
    history.push(locations.root())
  }

  if (isLoading) {
    return <LoadingPage />
  }

  return (
    <div className="notfound-body">
      <Navbar />
      <Page isFullscreen />
      <div className="NotFoundPage">
        <h1 className="title">{t('not_found_page.title')}</h1>
        <p className="subtitle">{t('not_found_page.subtitle')}</p>
        <Button className="back" onClick={handleClick} primary>
          {t('not_found_page.back')}
        </Button>
      </div>
      <Footer isFullscreen />
    </div>
  )
}
