import * as React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { Responsive } from 'decentraland-ui'
import { env } from 'decentraland-commons'
import SignInPage from 'decentraland-dapps/dist/containers/SignInPage'
import Intercom from 'decentraland-dapps/dist/components/Intercom'

import HomePage from 'components/HomePage'
import MobilePage from 'components/MobilePage'
import EditorPage from 'components/EditorPage'
import App from 'components/App'
import { locations } from 'routing/locations'

export class Routes extends React.Component {
  componentDidMount() {
    document.body.classList.remove('loading-overlay')
  }

  wrapInApp(Component: React.ComponentType<any>) {
    return (...props: any[]) => (
      <App>
        <Component {...props} />
      </App>
    )
  }

  renderRoutes() {
    return (
      <>
        <Responsive maxWidth={1024}>
          <Route component={this.wrapInApp(MobilePage)} />
        </Responsive>
        <Responsive minWidth={1024}>
          <Switch>
            <Route exact path={locations.root()} component={this.wrapInApp(HomePage)} />
            <Route exact path={locations.editor()} component={EditorPage} />
            <Route exact path={locations.signIn()} component={this.wrapInApp(SignInPage)} />
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
