import { createStore, compose, applyMiddleware } from 'redux'
import { routerMiddleware } from 'connected-react-router'
import createSagasMiddleware from 'redux-saga'
import { createLogger } from 'redux-logger'
import createHistory from 'history/createBrowserHistory'

import { env } from 'decentraland-commons'
import { createStorageMiddleware } from 'decentraland-dapps/dist/modules/storage/middleware'
import { createAnalyticsMiddleware } from 'decentraland-dapps/dist/modules/analytics/middleware'

import { scenarioMiddleware, eventEmitter } from 'scenarios/helpers/middleware'
import { PROVISION_SCENE, CREATE_SCENE } from 'modules/scene/actions'
import { CREATE_PROJECT, DELETE_PROJECT, EDIT_PROJECT_SUCCESS } from 'modules/project/actions'
import { EDITOR_UNDO, EDITOR_REDO } from 'modules/editor/actions'
import { ACCEPT_TERMS, SUBMIT_PROJECT_SUCCESS } from 'modules/contest/actions'
import { SET_USER_ID, SET_USER_EMAIL } from 'modules/user/actions'
import { SET_AVAILABLE_ASSET_PACKS } from 'modules/ui/sidebar/actions'
import { createRootReducer } from './reducer'
import { rootSaga } from './sagas'
import { migrations } from './migrations'

// @ts-ignore: Dev tools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const history = createHistory()
const rootReducer = createRootReducer(history)

const historyMiddleware = routerMiddleware(history)
const sagasMiddleware = createSagasMiddleware()
const loggerMiddleware = createLogger({
  predicate: () => env.isDevelopment(),
  collapsed: () => true
})
const { storageMiddleware, loadStorageMiddleware } = createStorageMiddleware({
  migrations,
  storageKey: env.get('REACT_APP_LOCAL_STORAGE_KEY'),
  paths: ['project', ['scene', 'present'], 'contest', 'user', ['ui', 'sidebar', 'availableAssetPackIds']],
  actions: [
    CREATE_PROJECT,
    CREATE_SCENE,
    PROVISION_SCENE,
    EDITOR_UNDO,
    EDITOR_REDO,
    EDIT_PROJECT_SUCCESS,
    DELETE_PROJECT,
    ACCEPT_TERMS,
    SUBMIT_PROJECT_SUCCESS,
    SET_USER_ID,
    SET_USER_EMAIL,
    SET_AVAILABLE_ASSET_PACKS
  ]
})
const analyticsMiddleware = createAnalyticsMiddleware(env.get('REACT_APP_SEGMENT_API_KEY'))

const middlewares = [historyMiddleware, sagasMiddleware, loggerMiddleware, storageMiddleware, analyticsMiddleware]

if (env.isDevelopment()) {
  middlewares.push(scenarioMiddleware)
}

const middleware = applyMiddleware(...middlewares)

const enhancer = composeEnhancers(middleware)
const store = createStore(rootReducer, enhancer)

sagasMiddleware.run(rootSaga)
loadStorageMiddleware(store)

export function getState() {
  return store.getState()
}

if (env.isDevelopment()) {
  // tslint:disable-next-line:semicolon
  ;(window as any).getState = store.getState

  const urlParams = new URLSearchParams(window.location.search)
  const scenarioName = urlParams.get('scenario')

  if (scenarioName) {
    const scenarios = require('../../scenarios').default
    if (scenarios[scenarioName]) {
      scenarios[scenarioName].run(store, eventEmitter)
    }
  }
}

export { store, history }
