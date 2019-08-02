import { createStore, compose, applyMiddleware } from 'redux'
import { routerMiddleware } from 'connected-react-router'
import createSagasMiddleware from 'redux-saga'
import { createLogger } from 'redux-logger'
import { createBrowserHistory } from 'history'

import { env } from 'decentraland-commons'
import { DataByKey } from 'decentraland-dapps/dist/lib/types'
import { createStorageMiddleware } from 'decentraland-dapps/dist/modules/storage/middleware'
import { createAnalyticsMiddleware } from 'decentraland-dapps/dist/modules/analytics/middleware'
import { configure as configureAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'

import { PROVISION_SCENE, CREATE_SCENE } from 'modules/scene/actions'
import { DEPLOY_TO_LAND_SUCCESS, MARK_DIRTY, CLEAR_DEPLOYMENT_SUCCESS } from 'modules/deployment/actions'
import { SET_PROJECT, DELETE_PROJECT, CREATE_PROJECT } from 'modules/project/actions'
import { SAVE_PROJECT_SUCCESS, SAVE_DEPLOYMENT_SUCCESS } from 'modules/sync/actions'
import { EDITOR_UNDO, EDITOR_REDO } from 'modules/editor/actions'
import { SET_USER_ID, SET_USER_EMAIL } from 'modules/user/actions'
import { SET_AVAILABLE_ASSET_PACKS } from 'modules/ui/sidebar/actions'
import { AUTH_SUCCESS, AUTH_FAILURE } from 'modules/auth/actions'
import { Project } from 'modules/project/types'
import { migrations } from 'modules/migrations/store'
import { createRootReducer } from './reducer'
import { rootSaga } from './sagas'
import { RootState } from './types'
import { Deployment } from 'modules/deployment/types'
import { Scene } from 'modules/scene/types'
const builderVersion = require('../../../package.json').version

configureAnalytics({
  transformPayload: payload => {
    if (typeof payload === 'string' || payload === undefined) return payload
    return { ...payload, version: builderVersion }
  }
})

// @ts-ignore: Dev tools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  ? // prettier-ignore
    (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      stateSanitizer: (state: RootState) => {
        const { scene: _, ...newState } = state
        return newState
      }
    })
  : compose

const history = createBrowserHistory()
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
  paths: [
    'project',
    ['scene', 'present'],
    'user',
    ['ui', 'sidebar', 'availableAssetPackIds'],
    ['deployment', 'data'],
    ['auth', 'data'],
    ['sync', 'localProjectIds']
  ],
  actions: [
    CREATE_PROJECT,
    SET_PROJECT,
    CREATE_SCENE,
    PROVISION_SCENE,
    EDITOR_UNDO,
    EDITOR_REDO,
    DELETE_PROJECT,
    SET_USER_ID,
    SET_USER_EMAIL,
    SET_AVAILABLE_ASSET_PACKS,
    DEPLOY_TO_LAND_SUCCESS,
    CLEAR_DEPLOYMENT_SUCCESS,
    MARK_DIRTY,
    AUTH_SUCCESS,
    AUTH_FAILURE,
    SAVE_PROJECT_SUCCESS,
    SAVE_DEPLOYMENT_SUCCESS
  ],
  transform: state => {
    let projects: DataByKey<Project> = {}
    let scene: DataByKey<Scene> = {}
    let deployments: DataByKey<Deployment> = {}

    for (let id of state.sync.project.localIds) {
      const project = state.project.data[id]
      projects[id] = project
      scene[project.sceneId] = state.scene.present.data[project.sceneId]
    }

    for (let id of state.sync.deployment.localIds) {
      deployments[id] = state.deployment.data[id]
    }

    const newState: RootState = {
      ...state,
      project: {
        ...state.project,
        data: projects
      },
      deployment: {
        ...state.deployment,
        data: deployments
      },
      scene: {
        ...state.scene,
        present: {
          ...state.scene.present,
          data: scene
        }
      }
    }

    return newState
  }
})

const analyticsMiddleware = createAnalyticsMiddleware(env.get('REACT_APP_SEGMENT_API_KEY'))

const middlewares = [historyMiddleware, sagasMiddleware, loggerMiddleware, storageMiddleware, analyticsMiddleware]

const middleware = applyMiddleware(...middlewares)

const enhancer = composeEnhancers(middleware)
const store = createStore(rootReducer, enhancer)

sagasMiddleware.run(rootSaga)
loadStorageMiddleware(store)

export function getState() {
  return store.getState()
}

export { store, history }
