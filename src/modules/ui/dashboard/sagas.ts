import { History } from 'history'
import { takeLatest, put, select, getContext } from 'redux-saga/effects'
import { SAVE_PROJECT_SUCCESS } from 'modules/sync/actions'
import { Project } from 'modules/project/types'
import { DELETE_PROJECT } from 'modules/project/actions'
import { setSync } from './actions'
import { getProjects } from './selectors'

export function* dashboardSaga() {
  yield takeLatest(SAVE_PROJECT_SUCCESS, handleSaveProjectSuccess)
  yield takeLatest(DELETE_PROJECT, handleDeleteProject)
}

function* handleSaveProjectSuccess() {
  yield put(setSync(true))
}

function* handleDeleteProject() {
  const history: History = yield getContext('history')
  const projects: Project[] = yield select(getProjects, history.location.search)
  if (projects.length === 0) {
    yield put(setSync(false))
  }
}
