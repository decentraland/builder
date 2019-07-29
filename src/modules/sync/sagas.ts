import { api } from 'lib/api'
import { takeLatest, select, put, call } from 'redux-saga/effects'
import { AUTH_SUCCESS } from 'modules/auth/actions'
import { getData as getProjects } from 'modules/project/selectors'
import { getData as getScenes } from 'modules/scene/selectors'
import { SAVE_PROJECT_REQUEST, saveProjectRequest, SaveProjectRequestAction, saveProjectSuccess, saveProjectFailure } from './actions'
import { getLocalProjectIds } from './selectors'

export function* syncSaga() {
  yield takeLatest(AUTH_SUCCESS, handleSyncProjects)
  yield takeLatest(SAVE_PROJECT_REQUEST, handleSaveProjectRequest)
}

function* handleSyncProjects() {
  const projects: ReturnType<typeof getProjects> = yield select(getProjects)
  const projectList = Object.values(projects)
  const localProjects: string[] = yield select(getLocalProjectIds)

  for (let i = 0; i < projectList.length; i++) {
    const project = projectList[i]
    if (localProjects.includes(project.id)) {
      yield put(saveProjectRequest(project))
    }
  }
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
