import * as React from 'react'
import classNames from 'classnames'
import { Page, Loader, Message, Narrow } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import Navigation from 'components/Navigation'
import Navbar from 'components/Navbar'
import Footer from 'components/Footer'
import SignInRequired from '../SignInRequired'
import { Props } from './LoggedInDetailPage.types'
import './LoggedInDetailPage.css'

export default class LoggedInDetailPage extends React.PureComponent<Props> {
  static defaultProps = {
    className: '',
    isPageFullscreen: false,
    isFooterFullscreen: false,
    isNavigationFullscreen: false,
    hasNavigation: true,
    isLoading: false
  }

  renderLogin() {
    return <SignInRequired />
  }

  renderLoading() {
    return <Loader size="large" active />
  }

  renderError() {
    const { error } = this.props

    return (
      <Narrow>
        <Message error size="tiny" visible content={error} header={t('logged_in_detail_page.error_title')} />
      </Narrow>
    )
  }

  render() {
    const {
      activeTab,
      className,
      hasNavigation,
      isPageFullscreen,
      isFooterFullscreen,
      isNavigationFullscreen,
      isLoggedIn,
      isLoggingIn,
      children,
      error
    } = this.props
    const isLoading = isLoggingIn || this.props.isLoading

    return (
      <>
        <Navbar isFullscreen />
        {hasNavigation ? <Navigation activeTab={activeTab} isFullscreen={isNavigationFullscreen} /> : null}
        <Page className={classNames('LoggedInDetailPage', className)} isFullscreen={isPageFullscreen}>
          {isLoading && !error ? this.renderLoading() : null}
          {!isLoggedIn && !isLoading && !error ? this.renderLogin() : null}
          {isLoggedIn && !isLoading && !error ? children : null}
          {error ? this.renderError() : null}
        </Page>
        <Footer isFullscreen={isFooterFullscreen} />
      </>
    )
  }
}
