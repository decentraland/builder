import * as React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import SignInPage from 'decentraland-dapps/dist/containers/SignInPage'

import HomePage from 'components/HomePage'
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
      <Switch>
        <Route exact path={locations.root()} component={this.wrapInApp(HomePage)} />
        <Route exact path={locations.editor()} component={EditorPage} />
        <Route exact path={locations.signIn()} component={this.wrapInApp(SignInPage)} />

        <Redirect to={locations.root()} />
      </Switch>
    )
  }

  render() {
    return this.renderRoutes()
  }
}
