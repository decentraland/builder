import { takeLatest, select, put, call, takeEvery, take } from 'redux-saga/effects'
import { isErrorWithMessage } from 'decentraland-dapps/dist/lib/error'
import type { DataByKey } from 'decentraland-dapps/dist/lib/types'
import { MessageTransport } from '@dcl/mini-rpc'
import { SceneMetricsClient } from '@dcl/inspector'
import type { SceneMetrics } from '@dcl/inspector/dist/redux/scene-metrics/types'
import { BuilderAPI } from 'lib/api/builder'
import { LOGIN_SUCCESS, LoginSuccessAction } from 'modules/identity/actions'
import { isLoggedIn } from 'modules/identity/selectors'
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
import { getData as getProjects, getCurrentProject } from 'modules/project/selectors'
import type { Project } from 'modules/project/types'
import { PROVISION_SCENE, ProvisionSceneAction, UpdateSceneAction, UPDATE_SCENE, updateMetrics } from 'modules/scene/actions'
import { getData as getScenes } from 'modules/scene/selectors'
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

export function* syncSaga(builder: BuilderAPI) {
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
  yield takeLatest(UPDATE_SCENE, handleUpdateScene)

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
      yield call(() => saveProject(project.id, project, scene, builder, debounce))
      yield put(saveProjectSuccess(project))
      if (scene.sdk7) {
        const iframe = document.getElementById('inspector') as HTMLIFrameElement | null
        if (!iframe || !iframe.contentWindow!) return

        const transport = new MessageTransport(window, iframe.contentWindow, '*')
        const sceneMetrics = new SceneMetricsClient(transport)

        const metrics: SceneMetrics = yield call(sceneMetrics.getMetrics)
        const limits: SceneMetrics = yield call(sceneMetrics.getLimits)
        const entitiesOutOfBoundaries: number = yield call(sceneMetrics.getEntitiesOutOfBoundaries)
        yield put(updateMetrics(scene.sdk7.id, metrics, limits, entitiesOutOfBoundaries))
      }
    } catch (e) {
      yield put(saveProjectFailure(project, isErrorWithMessage(e) ? e.message : 'Unknown error'))
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
      saveThumbnail(project.id, project, builder)
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
      yield put(deleteProjectFailure(id, isErrorWithMessage(e) ? e.message : 'Unknown error'))
    }
  }

  function* handleCreateProject(action: CreateProjectAction) {
    const isLoggedInResult: boolean = yield select(isLoggedIn)
    if (isLoggedInResult) {
      yield put(saveProjectRequest(action.payload.project))
    }
  }

  function* handleSetProject(action: SetProjectAction) {
    const isLoggedInResult: boolean = yield select(isLoggedIn)
    if (isLoggedInResult) {
      yield put(saveProjectRequest(action.payload.project))
    }
  }

  function* handleDeleteProject(action: DeleteProjectAction) {
    const isLoggedInResult: boolean = yield select(isLoggedIn)
    if (isLoggedInResult) {
      yield put(deleteProjectRequest(action.payload.project.id))
    }
  }

  function* handleProvisionScene(action: ProvisionSceneAction) {
    if (action.payload.init) return
    const isLoggedInResult: boolean = yield select(isLoggedIn)
    if (isLoggedInResult) {
      const project: Project | null = yield select(getCurrentProject)
      if (project) {
        yield put(saveProjectRequest(project))
      }
    }
  }

  function* handleUpdateScene(_action: UpdateSceneAction) {
    const isLoggedInResult: boolean = yield select(isLoggedIn)
    if (isLoggedInResult) {
      const project: Project | null = yield select(getCurrentProject)
      if (project) {
        yield put(saveProjectRequest(project))
      }
    }
  }
}
