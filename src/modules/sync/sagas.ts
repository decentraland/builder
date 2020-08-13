import { takeLatest, select, put, call, takeEvery, take } from 'redux-saga/effects'
import { DataByKey } from 'decentraland-dapps/dist/lib/types'

import { getData as getProjects, getCurrentProject } from 'modules/project/selectors'
import { getData as getScenes } from 'modules/scene/selectors'
import { Project } from 'modules/project/types'
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
import { PROVISION_SCENE, ProvisionSceneAction } from 'modules/scene/actions'

import {
  SAVE_PROJECT_REQUEST,
  saveProjectRequest,
  SaveProjectRequestAction,
  saveProjectSuccess,
  saveProjectFailure,
  sync,
  SyncAction,
  SYNC,
  RETRY_SYNC,
  RetrySyncAction,
  DeleteProjectRequestAction,
  deleteProjectSuccess,
  deleteProjectFailure,
  DELETE_PROJECT_REQUEST,
  deleteProjectRequest,
  SAVE_PROJECT_SUCCESS,
  SaveProjectSuccessAction
} from './actions'
import { getLocalProjectIds, getFailedProjectIds } from './selectors'
import { forEach, saveProject, saveThumbnail } from './utils'
import { builder } from 'lib/api/builder'
import { isLoggedIn } from 'modules/identity/selectors'
import { LOGIN_SUCCESS, LoginSuccessAction } from 'modules/identity/actions'

export function* syncSaga() {
  yield takeLatest(LOGIN_SUCCESS, handleLoginSuccess)
  yield takeLatest(SYNC, handleSync)
  yield takeLatest(RETRY_SYNC, handleRetrySync)
  yield takeEvery(SAVE_PROJECT_REQUEST, handleSaveProjectRequest)
  yield takeLatest(DELETE_PROJECT_REQUEST, handleDeleteProjectRequest)
  yield takeLatest(CREATE_PROJECT, handleCreateProject)
  yield takeLatest(SET_PROJECT, handleSetProject)
  yield takeLatest(DELETE_PROJECT, handleDeleteProject)
  yield takeLatest(PROVISION_SCENE, handleProvisionScene)
  yield takeLatest(SAVE_PROJECT_SUCCESS, handleSaveProjectSuccess)
}

function* handleLoginSuccess(_action: LoginSuccessAction) {
  yield put(sync())
}

function* handleSync(_action: SyncAction) {
  // sync projects
  const localProjectIds: string[] = yield select(getLocalProjectIds)
  const projects: DataByKey<Project> = yield select(getProjects)
  yield forEach<Project>(localProjectIds, projects, project => saveProjectRequest(project))
}

function* handleRetrySync(_action: RetrySyncAction) {
  // retry projects
  const failedProjectIds: string[] = yield select(getFailedProjectIds)
  const projects: DataByKey<Project> = yield select(getProjects)
  yield forEach<Project>(failedProjectIds, projects, project => saveProjectRequest(project))
}

function* handleSaveProjectRequest(action: SaveProjectRequestAction) {
  const project = action.payload.project
  const debounce = action.payload.debounce
  const scenes: ReturnType<typeof getScenes> = yield select(getScenes)
  const scene = scenes[project.sceneId]

  try {
    yield call(() => saveProject(project.id, project, scene, debounce))
    yield put(saveProjectSuccess(project))
  } catch (e) {
    yield put(saveProjectFailure(project, e))
  }
}

function* handleSaveProjectSuccess(action: SaveProjectSuccessAction) {
  const projects: ReturnType<typeof getProjects> = yield select(getProjects)
  let project = projects[action.payload.project.id]
  if (!project) return
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
    yield call(() => builder.deleteProject(id))
    yield put(deleteProjectSuccess(id))
  } catch (e) {
    yield put(deleteProjectFailure(id, e))
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
