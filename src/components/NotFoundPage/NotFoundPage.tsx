import * as React from 'react'
import { Button, Page } from 'decentraland-ui'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import Footer from 'components/Footer'
import Navbar from 'components/Navbar'
import LoadingPage from 'components/LoadingPage'

import { Props, State } from './NotFoundPage.types'
import './NotFoundPage.css'

const LOADING_TIMEOUT = 10000

export default class NotFoundPage extends React.PureComponent<Props, State> {
  state = {
    isLoading: true
  }

  mounted = false

  componentWillMount() {
    const analytics = getAnalytics()
    document.body.classList.add('notfound-body')
    analytics.track('Not found page', {})
    this.mounted = true
    this.setState({ isLoading: true })
    setTimeout(() => {
      if (this.mounted) {
        this.setState({ isLoading: false }), LOADING_TIMEOUT
      }
    })
  }

  componentWillUnmount() {
    document.body.classList.remove('notfound-body')
    this.mounted = false
  }

  handleOnClick = () => {
    this.props.onNavigate(locations.root())
  }

  render() {
    if (this.state.isLoading) {
      return <LoadingPage />
    }
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
