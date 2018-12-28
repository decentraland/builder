import * as React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { HomePage } from './components/HomePage'
import { locations } from './locations'

export class Routes extends React.Component {
  renderRoutes() {
    return (
      <Switch>
        <Route exact path={locations.root()} component={HomePage} />
        <Redirect to={locations.root()} />
      </Switch>
    )
  }

  render() {
    return <React.Fragment>{this.renderRoutes()}</React.Fragment>
  }
}
