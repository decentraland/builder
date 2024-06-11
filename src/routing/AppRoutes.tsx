import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Switch, Route, Redirect, useLocation } from 'react-router-dom'
import { Loader, Responsive } from 'decentraland-ui'
import { usePageTracking } from 'decentraland-dapps/dist/hooks/usePageTracking'

import { locations } from 'routing/locations'
import LoadingPage from 'components/LoadingPage'
import MobilePage from 'components/MobilePage'
import { ProtectedRoute } from 'modules/ProtectedRoute'
import { routerLocationChange } from 'modules/location/actions'

const ScenesPage = React.lazy(() => import('components/ScenesPage'))
const HomePage = React.lazy(() => import('components/HomePage'))
const SignInPage = React.lazy(() => import('components/SignInPage'))
const NotFoundPage = React.lazy(() => import('components/NotFoundPage'))
const EditorPage = React.lazy(() => import('components/EditorPage'))
const InspectorPage = React.lazy(() => import('components/InspectorPage'))
const SceneListPage = React.lazy(() => import('components/SceneListPage'))
const SceneViewPage = React.lazy(() => import('components/SceneViewPage'))
const LandPage = React.lazy(() => import('components/LandPage'))
const LandDetailPage = React.lazy(() => import('components/LandDetailPage'))
const LandTransferPage = React.lazy(() => import('components/LandTransferPage'))
const LandEditPage = React.lazy(() => import('components/LandEditPage'))
const ENSListPage = React.lazy(() => import('components/ENSListPage'))
const ENSDetailPage = React.lazy(() => import('components/ENSDetailPage'))
const WorldListPage = React.lazy(() => import('components/WorldListPage'))
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

export function AppRoutes() {
  usePageTracking()
  const location = useLocation()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(routerLocationChange(location))
  }, [location])

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
          <Route exact path={locations.inspector()} component={InspectorPage} />
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
          <ProtectedRoute exact path={locations.scenes()} component={ScenesPage} />
          <Route exact path={locations.sceneDetail()} component={SceneDetailPage} />
          <Route exact path={locations.templates()} component={TemplatesPage} />
          <Route exact path={locations.templateDetail()} component={TemplateDetailPage} />
          <Route exact key={1} path={locations.ens()} component={ENSListPage} />,
          <Route exact path={locations.ensDetail()} component={ENSDetailPage} />
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
