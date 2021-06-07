import * as React from 'react'
import { Page, Loader } from 'decentraland-ui'

import Navigation from 'components/Navigation'
import Navbar from 'components/Navbar'
import Footer from 'components/Footer'
import { Props } from './LoggedInDetailPage.types'
import SignInRequired from '../SignInRequired'
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
      children
    } = this.props
    const isLoading = isLoggingIn || this.props.isLoading

    return (
      <>
        <Navbar isFullscreen />
        {hasNavigation ? <Navigation activeTab={activeTab} isFullscreen={isNavigationFullscreen} /> : null}
        <Page className={`LoggedInDetailPage ${className}`} isFullscreen={isPageFullscreen}>
          {isLoading ? this.renderLoading() : null}
          {!isLoggedIn && !isLoading ? this.renderLogin() : null}
          {isLoggedIn && !isLoading ? children : null}
        </Page>
        <Footer isFullscreen={isFooterFullscreen} />
      </>
    )
  }
}
