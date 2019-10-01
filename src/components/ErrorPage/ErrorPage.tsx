import * as React from 'react'
import { Button, Page } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { IntercomWidget } from 'decentraland-dapps/dist/components/Intercom/IntercomWidget'

import Navbar from 'components/Navbar'
import Footer from 'components/Footer'
import { Props } from './ErrorPage.types'
import './ErrorPage.css'

const widget = IntercomWidget.getInstance()

export default class ErrorPage extends React.PureComponent<Props> {
  analytics = getAnalytics()

  componentDidMount() {
    document.body.classList.add('error-body')
    this.analytics.track('Error page', {})
  }

  componentWillUnmount() {
    document.body.classList.remove('error-body')
  }

  handleOnClick = () => {
    const { stackTrace } = this.props
    const lines = stackTrace.split('\n')
    widget.showNewMessage(`Hey! I just ran into this error using the Builder:\n${lines[0] + lines[1]}`)
  }

  handleSelectText = (el: React.MouseEvent<HTMLTextAreaElement>) => {
    el.currentTarget.focus()
    el.currentTarget.select()
  }

  render() {
    const { stackTrace } = this.props
    return (
      <>
        <Navbar isFullscreen />
        <Page isFullscreen>
          <div className="ErrorPage">
            <h1 className="title">{t('error_page.title')}</h1>
            <p className="subtitle">{t('error_page.subtitle')}</p>

            <textarea className="trace" cols={70} rows={10} value={stackTrace} onClick={this.handleSelectText} readOnly />

            <Button className="back" onClick={this.handleOnClick} primary>
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
}
