import { useCallback, useEffect } from 'react'
import { Button, Page } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { IntercomWidget } from 'decentraland-dapps/dist/components/Intercom/IntercomWidget'

import Navbar from 'components/Navbar'
import Footer from 'components/Footer'
import { Props } from './ErrorPage.types'
import './ErrorPage.css'

const widget = IntercomWidget.getInstance()

export default function ErrorPage(props: Props) {
  const { stackTrace } = props
  const analytics = getAnalytics()

  useEffect(() => {
    document.body.classList.add('error-body')
    analytics?.track('Error page', {})
    return () => {
      document.body.classList.remove('error-body')
    }
  }, [])

  const handleOnClick = useCallback(() => {
    const lines = stackTrace.split('\n')
    widget.showNewMessage(`Hey! I just ran into this error using the Builder:\n${lines[0] + lines[1]}`)
  }, [])

  const handleSelectText = useCallback((el: React.MouseEvent<HTMLTextAreaElement>) => {
    el.currentTarget.focus()
    el.currentTarget.select()
  }, [])

  return (
    <>
      <Navbar />
      <Page isFullscreen>
        <div className="ErrorPage">
          <h1 className="title">{t('error_page.title')}</h1>
          <p className="subtitle">{t('error_page.subtitle')}</p>

          <textarea className="trace" cols={70} rows={10} value={stackTrace} onClick={handleSelectText} readOnly />

          <Button className="back" onClick={handleOnClick} primary>
            {t('error_page.support')}
          </Button>
          <span className="suggestion">
            {t('error_page.or')} <a href=".">{t('error_page.reload')}</a>
          </span>
        </div>
      </Page>
      <Footer isFullscreen />
    </>
  )
}
