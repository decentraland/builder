import { combineReducers, createStore, compose, applyMiddleware } from 'redux'
import { routerMiddleware } from 'connected-react-router'
import createSagasMiddleware from 'redux-saga'
import createHistory from 'history/createBrowserHistory'

import { createRootReducer } from './reducer'
import { rootSaga } from './sagas'

const history = createHistory()
const rootReducer = createRootReducer(history)

// @ts-ignore: Dev tools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const historyMiddleware = routerMiddleware(history)
const sagasMiddleware = createSagasMiddleware()
const middleware = applyMiddleware(historyMiddleware, sagasMiddleware)

const enhancer = composeEnhancers(middleware)
const store = createStore(rootReducer, enhancer)

sagasMiddleware.run(rootSaga)

export { store, history }
