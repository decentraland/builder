import { createStore, compose, applyMiddleware } from 'redux'
import { routerMiddleware } from 'connected-react-router'
import createSagasMiddleware from 'redux-saga'

import createHistory from 'history/createBrowserHistory'
import { env } from 'decentraland-commons'
import { createStorageMiddleware } from 'decentraland-dapps/dist/modules/storage/middleware'

import { createRootReducer } from './reducer'
import { rootSaga } from './sagas'
import { scenarioMiddleware, eventEmitter } from 'scenarios/helpers/middleware'

const history = createHistory()
const rootReducer = createRootReducer(history)

// @ts-ignore: Dev tools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const historyMiddleware = routerMiddleware(history)
const sagasMiddleware = createSagasMiddleware()
const { storageMiddleware, loadStorageMiddleware } = createStorageMiddleware({
  storageKey: env.get('REACT_APP_LOCAL_STORAGE_KEY')
})
const middlewares = [historyMiddleware, storageMiddleware, sagasMiddleware]

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
