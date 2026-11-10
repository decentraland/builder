import { takeLatest, select, put, call } from 'redux-saga/effects'
import { isErrorWithMessage } from 'decentraland-dapps/dist/lib/error'
import { BuilderAPI } from 'lib/api/builder'
import { isLoggedIn } from 'modules/identity/selectors'
import { DELETE_PROJECT, DeleteProjectAction } from 'modules/project/actions'
import {
  DeleteProjectRequestAction,
  deleteProjectSuccess,
  deleteProjectFailure,
  DELETE_PROJECT_REQUEST,
  deleteProjectRequest
} from './actions'

export function* syncSaga(builder: BuilderAPI) {
  yield takeLatest(DELETE_PROJECT_REQUEST, handleDeleteProjectRequest)
  yield takeLatest(DELETE_PROJECT, handleDeleteProject)

  function* handleDeleteProjectRequest(action: DeleteProjectRequestAction) {
    const { id } = action.payload
    try {
      yield call(() => builder.deleteProject(id))
      yield put(deleteProjectSuccess(id))
    } catch (e) {
      yield put(deleteProjectFailure(id, isErrorWithMessage(e) ? e.message : 'Unknown error'))
    }
  }

  function* handleDeleteProject(action: DeleteProjectAction) {
    const isLoggedInResult: boolean = yield select(isLoggedIn)
    if (isLoggedInResult) {
      yield put(deleteProjectRequest(action.payload.project.id))
    }
  }
}
