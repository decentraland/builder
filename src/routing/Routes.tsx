import * as React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { Responsive } from 'decentraland-ui'
import { env } from 'decentraland-commons'
import Intercom from 'decentraland-dapps/dist/components/Intercom'
import { default as DappApp } from 'decentraland-dapps/dist/containers/App'

import { locations } from 'routing/locations'

import HomePage from 'components/HomePage'
import ErrorPage from 'components/ErrorPage'
import MobilePage from 'components/MobilePage'
import EditorPage from 'components/EditorPage'
import NotFoundPage from 'components/NotFoundPage'
import UnsupportedBrowserPage from 'components/UnsupportedBrowserPage'

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

  wrapInApp(Component: React.ComponentType<any>) {
    return (props: any) => (
      <DappApp>
        <Component {...props} />
      </DappApp>
    )
  }

  wrapHomepage(Component: React.ComponentType<any>) {
    return (props: any) => (
      <DappApp isOverlay isFullscreen>
        <Component {...props} />
      </DappApp>
    )
  }

  renderRoutes() {
    const { hasError, stackTrace } = this.state

    if (env.isDevelopment() && hasError) {
      const WrappedErrorPage = this.wrapInApp(ErrorPage)
      return <WrappedErrorPage stackTrace={stackTrace} />
    } else if (window.navigator.userAgent.includes('Edge')) {
      const WrappedUnsupportedBrowserPage = this.wrapInApp(UnsupportedBrowserPage)
      return <WrappedUnsupportedBrowserPage />
    }

    return (
      <>
        <Responsive maxWidth={1024} as={React.Fragment}>
          <Route component={this.wrapInApp(MobilePage)} />
        </Responsive>
        <Responsive minWidth={1025} as={React.Fragment}>
          <Switch>
            <Route exact path={locations.root()} component={this.wrapHomepage(HomePage)} />
            <Route exact path={locations.notFound()} component={this.wrapInApp(NotFoundPage)} />
            <Route exact path={locations.editor()} component={EditorPage} />
            <Redirect to={locations.root()} />
          </Switch>
        </Responsive>
      </>
    )
  }

  renderIntercom() {
    const APP_ID = env.get('REACT_APP_INTERCOM_APP_ID', '')
    return <Intercom appId={APP_ID} settings={{ alignment: 'right' }} />
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
