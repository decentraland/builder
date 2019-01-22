import * as React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import SignInPage from 'decentraland-dapps/dist/containers/SignInPage'

import HomePage from 'components/HomePage'
import EditorPage from 'components/EditorPage'
import { locations } from 'routing/locations'

export class Routes extends React.PureComponent {
  renderRoutes() {
    return (
      <Switch>
        <Route exact path={locations.root()} component={HomePage} />
        <Route exact path={locations.editor()} component={EditorPage} />
        <Route exact path={locations.signIn()} component={SignInPage} />

        <Redirect to={locations.root()} />
      </Switch>
    )
  }

  render() {
    return <React.Fragment>{this.renderRoutes()}</React.Fragment>
  }
}
