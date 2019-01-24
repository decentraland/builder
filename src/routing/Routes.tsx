import * as React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import App from 'decentraland-dapps/dist/containers/App'
import SignInPage from 'decentraland-dapps/dist/containers/SignInPage'

import HomePage from 'components/HomePage'
import EditorPage from 'components/EditorPage'
import * as languages from 'modules/translation/languages'
import { locations } from 'routing/locations'

export class Routes extends React.Component {
  wrapInApp(Component: React.ComponentType<any>) {
    return (...props: any[]) => (
      <App activePage="builder" locales={Object.keys(languages)}>
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
