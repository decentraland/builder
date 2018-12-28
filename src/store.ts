import { combineReducers, createStore, compose, applyMiddleware } from 'redux'
import createSagasMiddleware from 'redux-saga'
import createHistory from 'history/createBrowserHistory'
import { routerMiddleware, connectRouter } from 'connected-react-router'
import { all } from 'redux-saga/effects'

const history = createHistory()

const rootReducer = combineReducers({
  router: connectRouter(history)
})

function* rootSaga() {
  yield all([])
}

// @ts-ignore: Dev tools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const historyMiddleware = routerMiddleware(history)

const sagasMiddleware = createSagasMiddleware()

const middleware = applyMiddleware(historyMiddleware, sagasMiddleware)

const enhancer = composeEnhancers(middleware)

const store = createStore(rootReducer, enhancer)

sagasMiddleware.run(rootSaga)

export { store, history }
