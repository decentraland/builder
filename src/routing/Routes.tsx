import * as React from 'react'
import { Center, Page } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import Intercom from 'components/Intercom'
import Footer from 'components/Footer'
import Navbar from 'components/Navbar'
import ErrorPage from 'components/ErrorPage'
import UnsupportedBrowserPage from 'components/UnsupportedBrowserPage'
import { isDevelopment } from 'lib/environment'
import { AppRoutes } from './AppRoutes'
import { Props, State } from './Routes.types'

export default class Routes extends React.Component<Props, State> {
  state = {
    hasError: false,
    stackTrace: ''
  }

  componentDidCatch(err: Error) {
    this.setState({
      hasError: true,
      stackTrace: err.stack || 'No details avaibale'
    })
  }

  componentDidMount() {
    document.body.classList.remove('loading-overlay')
  }

  renderMaintenancePage() {
    return (
      <>
        <Navbar />
        <Page>
          <Center>🚧 {t('maintainance.notice')} 🚧</Center>
        </Page>
        <Footer />
      </>
    )
  }

  renderRoutes() {
    const { inMaintenance } = this.props
    const { hasError, stackTrace } = this.state

    if (isDevelopment && hasError) {
      return <ErrorPage stackTrace={stackTrace} />
    } else if (window.navigator.userAgent.includes('Edge')) {
      return <UnsupportedBrowserPage />
    }

    if (inMaintenance) {
      return this.renderMaintenancePage()
    }

    return <AppRoutes />
  }

  renderIntercom() {
    return <Intercom />
  }

  render() {
    return (
      <>
        {this.renderRoutes()}
        {this.renderIntercom()}
      </>
    )
  }
}
