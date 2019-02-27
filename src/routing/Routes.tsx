import * as React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { Responsive } from 'decentraland-ui'
import { env } from 'decentraland-commons'
import Intercom from 'decentraland-dapps/dist/components/Intercom'

import { locations } from 'routing/locations'

import HomePage from 'components/HomePage'
import MobilePage from 'components/MobilePage'
import EditorPage from 'components/EditorPage'
import NotFoundPage from 'components/NotFoundPage'
import App from 'components/App'

import { Props, State } from './Routes.types'
import ErrorPage from 'components/ErrorPage'

export class Routes extends React.Component<Props, State> {
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
      <App>
        <Component {...props} />
      </App>
    )
  }

  renderRoutes() {
    const { hasError, stackTrace } = this.state

    if (env.isDevelopment() && hasError) {
      const WrappedErrorPage = this.wrapInApp(ErrorPage)
      return <WrappedErrorPage stackTrace={stackTrace} />
    }

    return (
      <>
        <Responsive maxWidth={1024}>
          <Route component={this.wrapInApp(MobilePage)} />
        </Responsive>
        <Responsive minWidth={1024}>
          <Switch>
            <Route exact path={locations.root()} component={this.wrapInApp(HomePage)} />
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
