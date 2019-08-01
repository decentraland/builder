import { takeLatest, select, put, call } from 'redux-saga/effects'
import { DataByKey } from 'decentraland-dapps/dist/lib/types'

import { AUTH_SUCCESS, AuthSuccessAction } from 'modules/auth/actions'
import { getData as getProjects } from 'modules/project/selectors'
import { getData as getDeployments } from 'modules/deployment/selectors'
import { getData as getScenes } from 'modules/scene/selectors'
import { Project } from 'modules/project/types'
import { Deployment } from 'modules/deployment/types'
import { api } from 'lib/api'
import {
  SAVE_PROJECT_REQUEST,
  saveProjectRequest,
  SaveProjectRequestAction,
  saveProjectSuccess,
  saveProjectFailure,
  SAVE_DEPLOYMENT_REQUEST,
  saveDeploymentSuccess,
  saveDeploymentFailure,
  SaveDeploymentRequestAction,
  sync,
  SyncAction,
  SYNC,
  RETRY_SYNC,
  RetrySyncAction,
  saveDeploymentRequest
} from './actions'
import { getLocalProjectIds, getFailedProjectIds, getFailedDeploymentIds, getLocalDeploymentIds } from './selectors'
import { forEach } from './utils'

export function* syncSaga() {
  yield takeLatest(AUTH_SUCCESS, handleAuthSuccess)
  yield takeLatest(SYNC, handleSync)
  yield takeLatest(RETRY_SYNC, handleRetrySync)
  yield takeLatest(SAVE_PROJECT_REQUEST, handleSaveProjectRequest)
  yield takeLatest(SAVE_DEPLOYMENT_REQUEST, handleSaveDeploymentRequest)
}

function* handleAuthSuccess(_action: AuthSuccessAction) {
  yield put(sync())
}

function* handleSync(_action: SyncAction) {
  // sync projects
  const localProjectIds: string[] = yield select(getLocalProjectIds)
  const projects: DataByKey<Project> = yield select(getProjects)
  yield forEach<Project>(localProjectIds, projects, project => saveProjectRequest(project))

  // sync deployments
  const localDeploymentIds: string[] = yield select(getLocalDeploymentIds)
  const deployments: DataByKey<Deployment> = yield select(getDeployments)
  yield forEach<Deployment>(localDeploymentIds, deployments, deployment => saveDeploymentRequest(deployment))
}

function* handleRetrySync(_action: RetrySyncAction) {
  // retry projects
  const failedProjectIds: string[] = yield select(getFailedProjectIds)
  const projects: DataByKey<Project> = yield select(getProjects)
  yield forEach<Project>(failedProjectIds, projects, project => saveProjectRequest(project))

  // retry deployments
  const failedDeploymentIds: string[] = yield select(getFailedDeploymentIds)
  const deployments: DataByKey<Deployment> = yield select(getDeployments)
  yield forEach<Deployment>(failedDeploymentIds, deployments, deployment => saveDeploymentRequest(deployment))
}

function* handleSaveProjectRequest(action: SaveProjectRequestAction) {
  const project = action.payload.project
  const scenes: ReturnType<typeof getScenes> = yield select(getScenes)
  const scene = scenes[project.sceneId]

  try {
    yield call(() => api.saveProject(project, scene))
    yield put(saveProjectSuccess(project))
  } catch (e) {
    yield put(saveProjectFailure(project, e))
  }
}

function* handleSaveDeploymentRequest(action: SaveDeploymentRequestAction) {
  const { deployment } = action.payload
  try {
    yield call(() => api.saveDeployment(deployment))
    yield put(saveDeploymentSuccess(deployment))
  } catch (e) {
    yield put(saveDeploymentFailure(deployment, e.message))
  }
}
