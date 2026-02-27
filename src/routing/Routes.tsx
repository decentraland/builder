import React, { Component, memo, useCallback, useEffect, useState } from 'react'
import { Center, Page } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import Intercom from 'components/Intercom'
import Footer from 'components/Footer'
import Navbar from 'components/Navbar'
import ErrorPage from 'components/ErrorPage'
import UnsupportedBrowserPage from 'components/UnsupportedBrowserPage'
import { isDevelopment } from 'lib/environment'
import { AppRoutes } from './AppRoutes'
import { ErrorBoundaryProps, ErrorBoundaryState, Props } from './Routes.types'

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  componentDidCatch(error: Error) {
    this.setState({ hasError: true })
    this.props.onError(error)
  }

  render() {
    if (this.state.hasError) {
      return null
    }
    return this.props.children
  }
}

const MaintenancePage = memo(() => (
  <>
    <Navbar />
    <Page>
      <Center>🚧 {t('maintainance.notice')} 🚧</Center>
    </Page>
    <Footer />
  </>
))

const Routes: React.FC<Props> = ({ inMaintenance }) => {
  const [errorState, setErrorState] = useState<{ hasError: boolean; stackTrace: string }>({
    hasError: false,
    stackTrace: ''
  })

  useEffect(() => {
    document.body.classList.remove('loading-overlay')
  }, [])

  const handleError = useCallback((error: Error) => {
    setErrorState({
      hasError: true,
      stackTrace: error.stack || 'No details available'
    })
  }, [])

  const renderRoutes = useCallback(() => {
    if (isDevelopment && errorState.hasError) {
      return <ErrorPage stackTrace={errorState.stackTrace} />
    }

    if (window.navigator.userAgent.includes('Edge')) {
      return <UnsupportedBrowserPage />
    }

    if (inMaintenance) {
      return <MaintenancePage />
    }

    return <AppRoutes />
  }, [errorState, inMaintenance])

  return (
    <ErrorBoundary onError={handleError}>
      {renderRoutes()}
      <Intercom />
    </ErrorBoundary>
  )
}

export default memo(Routes)
