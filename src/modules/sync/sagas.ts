import { takeLatest, select, put, call, takeEvery, take } from 'redux-saga/effects'
import { DataByKey } from 'decentraland-dapps/dist/lib/types'

import { AUTH_SUCCESS, AuthSuccessAction } from 'modules/auth/actions'
import { getData as getProjects, getCurrentProject } from 'modules/project/selectors'
import { getData as getDeployments } from 'modules/deployment/selectors'
import { getData as getScenes } from 'modules/scene/selectors'
import { Project } from 'modules/project/types'
import { Deployment } from 'modules/deployment/types'
import {
  CREATE_PROJECT,
  CreateProjectAction,
  SET_PROJECT,
  SetProjectAction,
  DELETE_PROJECT,
  DeleteProjectAction,
  EDIT_PROJECT_THUMBNAIL,
  EditProjectThumbnailAction
} from 'modules/project/actions'
import { isLoggedIn } from 'modules/auth/selectors'
import { PROVISION_SCENE, ProvisionSceneAction } from 'modules/scene/actions'
import {
  DEPLOY_TO_LAND_SUCCESS,
  DeployToLandSuccessAction,
  CLEAR_DEPLOYMENT_SUCCESS,
  ClearDeploymentSuccessAction,
  MARK_DIRTY,
  MarkDirtyAction
} from 'modules/deployment/actions'
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
  saveDeploymentRequest,
  DeleteProjectRequestAction,
  deleteProjectSuccess,
  deleteProjectFailure,
  deleteDeploymentSuccess,
  deleteDeploymentFailure,
  DELETE_PROJECT_REQUEST,
  DELETE_DEPLOYMENT_REQUEST,
  DeleteDeploymentRequestAction,
  deleteProjectRequest,
  deleteDeploymentRequest,
  SAVE_PROJECT_SUCCESS,
  SaveProjectSuccessAction
} from './actions'
import { getLocalProjectIds, getFailedProjectIds, getFailedDeploymentIds, getLocalDeploymentIds } from './selectors'
import { forEach, saveProject, saveThumbnail } from './utils'

export function* syncSaga() {
  yield takeLatest(AUTH_SUCCESS, handleAuthSuccess)
  yield takeLatest(SYNC, handleSync)
  yield takeLatest(RETRY_SYNC, handleRetrySync)
  yield takeEvery(SAVE_PROJECT_REQUEST, handleSaveProjectRequest)
  yield takeLatest(DELETE_PROJECT_REQUEST, handleDeleteProjectRequest)
  yield takeEvery(SAVE_DEPLOYMENT_REQUEST, handleSaveDeploymentRequest)
  yield takeLatest(DELETE_DEPLOYMENT_REQUEST, handleDeleteDeploymentRequest)
  yield takeLatest(CREATE_PROJECT, handleCreateProject)
  yield takeLatest(SET_PROJECT, handleSetProject)
  yield takeLatest(DELETE_PROJECT, handleDeleteProject)
  yield takeLatest(PROVISION_SCENE, handleProvisionScene)
  yield takeLatest(DEPLOY_TO_LAND_SUCCESS, handleDeployToLandSuccess)
  yield takeLatest(CLEAR_DEPLOYMENT_SUCCESS, handleClearDeploymentSuccess)
  yield takeLatest(MARK_DIRTY, handleMarkDirty)
  yield takeLatest(SAVE_PROJECT_SUCCESS, handleSaveProjectSuccess)
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

  // wait for projects to be saved before syncing deployments
  let waitFor = localProjectIds.filter(projectId => localDeploymentIds.includes(projectId))

  while (waitFor.length > 0) {
    const action: SaveProjectSuccessAction = yield take(SAVE_PROJECT_SUCCESS)
    const { project } = action.payload
    waitFor = waitFor.filter(projectId => projectId !== project.id)
  }

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
    yield call(() => saveProject(project.id, project, scene))
    yield put(saveProjectSuccess(project))
  } catch (e) {
    yield put(saveProjectFailure(project, e))
  }
}

function* handleSaveProjectSuccess(action: SaveProjectSuccessAction) {
  const projects: ReturnType<typeof getProjects> = yield select(getProjects)
  let project = projects[action.payload.project.id]
  if (!project.thumbnail) {
    const action: EditProjectThumbnailAction = yield take(EDIT_PROJECT_THUMBNAIL)
    project = {
      ...project,
      thumbnail: action.payload.thumbnail
    }
  }
  try {
    saveThumbnail(project.id, project)
  } catch (e) {
    console.error(e)
  }
}

function* handleDeleteProjectRequest(action: DeleteProjectRequestAction) {
  const { id } = action.payload
  try {
    yield call(() => api.deleteProject(id))
    yield put(deleteProjectSuccess(id))
  } catch (e) {
    yield put(deleteProjectFailure(id, e))
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

function* handleDeleteDeploymentRequest(action: DeleteDeploymentRequestAction) {
  const { id } = action.payload
  try {
    yield call(() => api.deleteDeployment(id))
    yield put(deleteDeploymentSuccess(id))
  } catch (e) {
    yield put(deleteDeploymentFailure(id, e))
  }
}

function* handleCreateProject(action: CreateProjectAction) {
  if (yield select(isLoggedIn)) {
    yield put(saveProjectRequest(action.payload.project))
  }
}

function* handleSetProject(action: SetProjectAction) {
  if (yield select(isLoggedIn)) {
    yield put(saveProjectRequest(action.payload.project))
  }
}

function* handleDeleteProject(action: DeleteProjectAction) {
  if (yield select(isLoggedIn)) {
    yield put(deleteProjectRequest(action.payload.project.id))
  }
}

function* handleProvisionScene(action: ProvisionSceneAction) {
  if (action.payload.init) return
  if (yield select(isLoggedIn)) {
    const project: Project | null = yield select(getCurrentProject)
    if (project) {
      yield put(saveProjectRequest(project))
    }
  }
}

function* handleDeployToLandSuccess(action: DeployToLandSuccessAction) {
  if (yield select(isLoggedIn)) {
    yield put(saveDeploymentRequest(action.payload.deployment))
  }
}

function* handleClearDeploymentSuccess(action: ClearDeploymentSuccessAction) {
  if (yield select(isLoggedIn)) {
    yield put(deleteDeploymentRequest(action.payload.projectId))
  }
}

function* handleMarkDirty(action: MarkDirtyAction) {
  if (yield select(isLoggedIn)) {
    const deployments: DataByKey<Deployment> = yield select(getDeployments)
    const deployment = deployments[action.payload.projectId]
    if (deployment) {
      yield put(saveDeploymentRequest(deployment))
    }
  }
}
