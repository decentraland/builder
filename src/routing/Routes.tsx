import * as React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { Responsive } from 'decentraland-ui'
import { env } from 'decentraland-commons'
import Intercom from 'decentraland-dapps/dist/components/Intercom'

import { locations } from 'routing/locations'

import EditorPage from 'components/EditorPage'
import ErrorPage from 'components/ErrorPage'
import HomePage from 'components/HomePage'
import LoadingPage from 'components/LoadingPage'
import MobilePage from 'components/MobilePage'
import NotFoundPage from 'components/NotFoundPage'
import UnsupportedBrowserPage from 'components/UnsupportedBrowserPage'
import SceneViewPage from 'components/SceneViewPage'
import SceneListPage from 'components/SceneListPage'
import SignInPage from 'components/SignInPage'
import MigratePage from 'components/MigratePage'
import LandPage from 'components/LandPage'
import LandDetailPage from 'components/LandDetailPage'
import LandTransferPage from 'components/LandTransferPage'
import LandEditPage from 'components/LandEditPage'
import LandEnsPage from 'components/LandEnsPage'
import LandOperatorPage from 'components/LandOperatorPage'
import ActivityPage from 'components/ActivityPage'
import SettingsPage from 'components/SettingsPage'
import SceneDetailPage from 'components/SceneDetailPage'

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

  renderRoutes() {
    const { hasError, stackTrace } = this.state

    if (env.isDevelopment() && hasError) {
      return <ErrorPage stackTrace={stackTrace} />
    } else if (window.navigator.userAgent.includes('Edge')) {
      return <UnsupportedBrowserPage />
    }

    return (
      <>
        <Responsive maxWidth={1024} as={React.Fragment}>
          <Switch>
            <Route exact path={locations.poolSearch()} component={SceneListPage} />
            <Route exact path={locations.sceneView()} component={SceneViewPage} />
            <Route exact path={locations.poolView()} component={SceneViewPage} />
            <Route component={MobilePage} />
          </Switch>
        </Responsive>
        <Responsive minWidth={1025} as={React.Fragment}>
          <Switch>
            <Route exact path={locations.root()} component={HomePage} />
            <Route exact path={locations.notFound()} component={NotFoundPage} />
            <Route exact path={locations.editor()} component={EditorPage} />
            <Route exact path={locations.poolSearch()} component={SceneListPage} />
            <Route exact path={locations.migrate()} component={MigratePage} />
            <Route exact path={locations.sceneView()} component={SceneViewPage} />
            <Route exact path={locations.poolView()} component={SceneViewPage} />
            <Route exact path={locations.callback()} component={LoadingPage} />
            <Route exact path={locations.signIn()} component={SignInPage} />
            <Route exact path={locations.land()} component={LandPage} />
            <Route exact path={locations.landDetail()} component={LandDetailPage} />
            <Route exact path={locations.landTransfer()} component={LandTransferPage} />
            {env.get('REACT_APP_FF_ENS') ? <Route exact path={locations.landEns()} component={LandEnsPage} /> : null}
            <Route exact path={locations.landEdit()} component={LandEditPage} />
            <Route exact path={locations.landOperator()} component={LandOperatorPage} />
            <Route exact path={locations.activity()} component={ActivityPage} />
            <Route exact path={locations.settings()} component={SettingsPage} />
            <Route exact path={locations.sceneDetail()} component={SceneDetailPage} />
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
