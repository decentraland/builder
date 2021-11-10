import * as React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { Center, Page, Responsive } from 'decentraland-ui'
import { env } from 'decentraland-commons'
import Intercom from 'decentraland-dapps/dist/components/Intercom'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { locations } from 'routing/locations'

import Footer from 'components/Footer'
import Navbar from 'components/Navbar'
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
import LandPage from 'components/LandPage'
import LandDetailPage from 'components/LandDetailPage'
import LandTransferPage from 'components/LandTransferPage'
import LandEditPage from 'components/LandEditPage'
import ENSListPage from 'components/ENSListPage'
import ClaimENSPage from 'components/ClaimENSPage'
import LandSelectENSPage from 'components/LandSelectENSPage'
import LandAssignENSPage from 'components/LandAssignENSPage'
import ENSSelectLandPage from 'components/ENSSelectLandPage'
import LandOperatorPage from 'components/LandOperatorPage'
import ActivityPage from 'components/ActivityPage'
import SettingsPage from 'components/SettingsPage'
import SceneDetailPage from 'components/SceneDetailPage'
import CollectionsPage from 'components/CollectionsPage'
import ItemDetailPage from 'components/ItemDetailPage'
import CollectionDetailPage from 'components/CollectionDetailPage'
import ThirdPartyCollectionDetailPage from 'components/ThirdPartyCollectionDetailPage'
import ItemEditorPage from 'components/ItemEditorPage'
import CurationPage from 'components/CurationPage'
import { isDevelopment } from 'lib/environment'

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

  renderMaintainancePage() {
    return (
      <>
        <Navbar />
        <Page>
          <Center>🚧 {t('maintainance.notice')} 🚧</Center>
        </Page>
        <Footer />
      </>
    )
  }

  renderRoutes() {
    const { hasError, stackTrace } = this.state

    if (isDevelopment && hasError) {
      return <ErrorPage stackTrace={stackTrace} />
    } else if (window.navigator.userAgent.includes('Edge')) {
      return <UnsupportedBrowserPage />
    }

    if (env.get('REACT_APP_UNDER_MAINTAINANCE')) {
      return this.renderMaintainancePage()
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
            <Route exact path={locations.sceneEditor()} component={EditorPage} />
            <Route exact path={locations.poolSearch()} component={SceneListPage} />
            <Route exact path={locations.sceneView()} component={SceneViewPage} />
            <Route exact path={locations.poolView()} component={SceneViewPage} />
            <Route exact path={locations.callback()} component={LoadingPage} />
            <Route exact path={locations.signIn()} component={SignInPage} />
            <Route exact path={locations.land()} component={LandPage} />
            <Route exact path={locations.landDetail()} component={LandDetailPage} />
            <Route exact path={locations.landTransfer()} component={LandTransferPage} />
            <Route exact path={locations.landEdit()} component={LandEditPage} />
            <Route exact path={locations.landOperator()} component={LandOperatorPage} />
            <Route exact path={locations.activity()} component={ActivityPage} />
            <Route exact path={locations.settings()} component={SettingsPage} />
            <Route exact path={locations.sceneDetail()} component={SceneDetailPage} />
            {env.get('REACT_APP_FF_ENS')
              ? [
                  <Route exact key={1} path={locations.ens()} component={ENSListPage} />,
                  <Route exact key={2} path={locations.claimENS()} component={ClaimENSPage} />,
                  <Route exact key={3} path={locations.landSelectENS()} component={LandSelectENSPage} />,
                  <Route exact key={4} path={locations.landAssignENS()} component={LandAssignENSPage} />,
                  <Route exact key={5} path={locations.ensSelectLand()} component={ENSSelectLandPage} />
                ]
              : null}
            {env.get('REACT_APP_FF_WEARABLES')
              ? [
                  <Route exact key={1} path={locations.collections()} component={CollectionsPage} />,
                  <Route exact key={2} path={locations.itemDetail()} component={ItemDetailPage} />,
                  <Route exact key={3} path={locations.collectionDetail()} component={CollectionDetailPage} />,
                  <Route exact key={4} path={locations.itemEditor()} component={ItemEditorPage} />,
                  <Route exact key={5} path={locations.curation()} component={CurationPage} />
                ]
              : null}

            {/* This env check will be replaced for https://github.com/decentraland/feature-flags */
            env.get('REACT_APP_FF_THIRD_PARTY_WEARABLES')
              ? [<Route exact key={1} path={locations.thirdPartyCollectionDetail()} component={ThirdPartyCollectionDetailPage} />]
              : null}

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
