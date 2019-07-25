import * as React from 'react'
import { Button, Page } from 'decentraland-ui'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import Footer from 'components/Footer'
import Navbar from 'components/Navbar'

import { Props } from './NotFoundPage.types'
import './NotFoundPage.css'

export default class NotFoundPage extends React.PureComponent<Props> {
  componentDidMount() {
    const analytics = getAnalytics()
    document.body.classList.add('notfound-body')
    analytics.track('Not found page', {})
  }

  componentWillUnmount() {
    document.body.classList.remove('notfound-body')
  }

  handleOnClick = () => {
    this.props.onNavigate(locations.root())
  }

  render() {
    return (
      <>
        <Navbar isFullscreen />
        <Page isFullscreen />
        <div className="NotFoundPage">
          <h1 className="title">{t('not_found_page.title')}</h1>
          <p className="subtitle">{t('not_found_page.subtitle')}</p>
          <Button className="back" onClick={this.handleOnClick} primary>
            {t('not_found_page.back')}
          </Button>
        </div>
        <Footer isFullscreen />
      </>
    )
  }
}
