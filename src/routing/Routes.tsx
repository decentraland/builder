import * as React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
// TODO: enable this when creating the home page
// import { HomePage } from './components/HomePage'
import EditorPage from 'components/EditorPage'
import { locations } from 'routing/locations'

export class Routes extends React.Component {
  renderRoutes() {
    return (
      <Switch>
        <Route exact path={locations.root()} component={EditorPage} />
        <Route exact path={locations.editor()} component={EditorPage} />
        <Redirect to={locations.root()} />
      </Switch>
    )
  }

  render() {
    return <React.Fragment>{this.renderRoutes()}</React.Fragment>
  }
}
