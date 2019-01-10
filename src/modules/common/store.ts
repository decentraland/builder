import { combineReducers, createStore, compose, applyMiddleware } from 'redux'
import { routerMiddleware } from 'connected-react-router'
import createSagasMiddleware from 'redux-saga'
import createHistory from 'history/createBrowserHistory'
import { env } from 'decentraland-commons'
import { createStorageMiddleware } from 'decentraland-dapps/dist/modules/storage/middleware'

import { createRootReducer } from './reducer'
import { rootSaga } from './sagas'

const history = createHistory()
const rootReducer = createRootReducer(history)

// @ts-ignore: Dev tools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const historyMiddleware = routerMiddleware(history)
const sagasMiddleware = createSagasMiddleware()
const { storageMiddleware, loadStorageMiddleware } = createStorageMiddleware({
  storageKey: env.get('REACT_APP_LOCAL_STORAGE_KEY')
})
const middleware = applyMiddleware(historyMiddleware, storageMiddleware, sagasMiddleware)

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
}

export { store, history }
