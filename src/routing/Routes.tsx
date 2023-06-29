import * as React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { Center, Loader, Page, Responsive } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { locations } from 'routing/locations'

import Intercom from 'components/Intercom'
import Footer from 'components/Footer'
import Navbar from 'components/Navbar'
import ErrorPage from 'components/ErrorPage'
import LoadingPage from 'components/LoadingPage'
import MobilePage from 'components/MobilePage'
import UnsupportedBrowserPage from 'components/UnsupportedBrowserPage'
import { isDevelopment } from 'lib/environment'

import { Props, State } from './Routes.types'
import { ProtectedRoute } from 'modules/ProtectedRoute'

const ScenesPage = React.lazy(() => import('components/ScenesPage'))
const HomePage = React.lazy(() => import('components/HomePage'))
const SignInPage = React.lazy(() => import('components/SignInPage'))
const NotFoundPage = React.lazy(() => import('components/NotFoundPage'))
const EditorPage = React.lazy(() => import('components/EditorPage'))
const SceneListPage = React.lazy(() => import('components/SceneListPage'))
const SceneViewPage = React.lazy(() => import('components/SceneViewPage'))
const LandPage = React.lazy(() => import('components/LandPage'))
const LandDetailPage = React.lazy(() => import('components/LandDetailPage'))
const LandTransferPage = React.lazy(() => import('components/LandTransferPage'))
const LandEditPage = React.lazy(() => import('components/LandEditPage'))
const ENSListPage = React.lazy(() => import('components/ENSListPage'))
const WorldListPage = React.lazy(() => import('components/WorldListPage'))
const ClaimENSPage = React.lazy(() => import('components/ClaimENSPage'))
const LandSelectENSPage = React.lazy(() => import('components/LandSelectENSPage'))
const LandAssignENSPage = React.lazy(() => import('components/LandAssignENSPage'))
const ENSSelectLandPage = React.lazy(() => import('components/ENSSelectLandPage'))
const LandOperatorPage = React.lazy(() => import('components/LandOperatorPage'))
const ActivityPage = React.lazy(() => import('components/ActivityPage'))
const SettingsPage = React.lazy(() => import('components/SettingsPage'))
const SceneDetailPage = React.lazy(() => import('components/SceneDetailPage'))
const CollectionsPage = React.lazy(() => import('components/CollectionsPage'))
const ItemDetailPage = React.lazy(() => import('components/ItemDetailPage'))
const CollectionDetailPage = React.lazy(() => import('components/CollectionDetailPage'))
const ThirdPartyCollectionDetailPage = React.lazy(() => import('components/ThirdPartyCollectionDetailPage'))
const ItemEditorPage = React.lazy(() => import('components/ItemEditorPage'))
const CurationPage = React.lazy(() => import('components/CurationPage'))
const TemplatesPage = React.lazy(() => import('components/TemplatesPage'))
const TemplateDetailPage = React.lazy(() => import('components/TemplateDetailPage'))

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

  renderMaintenancePage() {
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
    const { inMaintenance } = this.props
    const { hasError, stackTrace } = this.state

    if (isDevelopment && hasError) {
      return <ErrorPage stackTrace={stackTrace} />
    } else if (window.navigator.userAgent.includes('Edge')) {
      return <UnsupportedBrowserPage />
    }

    if (inMaintenance) {
      return this.renderMaintenancePage()
    }

    return (
      <React.Suspense fallback={<Loader size="huge" active />}>
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
            {/* <Route exact path={locations.scenes()} component={ScenesPage} /> */}
            <ProtectedRoute exact path={locations.scenes()} component={ScenesPage} />
            <Route exact path={locations.sceneDetail()} component={SceneDetailPage} />
            <Route exact path={locations.templates()} component={TemplatesPage} />
            <Route exact path={locations.templateDetail()} component={TemplateDetailPage} />
            <Route exact key={1} path={locations.ens()} component={ENSListPage} />,
            <Route exact key={2} path={locations.claimENS()} component={ClaimENSPage} />,
            <Route exact key={3} path={locations.landSelectENS()} component={LandSelectENSPage} />,
            <Route exact key={4} path={locations.landAssignENS()} component={LandAssignENSPage} />,
            <Route exact key={5} path={locations.ensSelectLand()} component={ENSSelectLandPage} />
            <Route exact path={locations.worlds()} component={WorldListPage} />,
            <Route exact key={1} path={locations.collections()} component={CollectionsPage} />,
            <Route exact key={2} path={locations.itemDetail()} component={ItemDetailPage} />,
            <Route exact key={3} path={locations.collectionDetail()} component={CollectionDetailPage} />,
            <Route exact key={4} path={locations.itemEditor()} component={ItemEditorPage} />,
            <Route exact key={5} path={locations.curation()} component={CurationPage} />
            <Route exact key={1} path={locations.thirdPartyCollectionDetail()} component={ThirdPartyCollectionDetailPage} />
            <Redirect to={locations.root()} />
          </Switch>
        </Responsive>
      </React.Suspense>
    )
  }

  renderIntercom() {
    return <Intercom />
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
