import { put, takeLatest } from 'redux-saga/effects'

import { SUBMIT_PROJECT_REQUEST, SubmitProjectRequestAction, submitProjectSuccess, submitProjectFailure } from './actions'

export function* contestSaga() {
  yield takeLatest(SUBMIT_PROJECT_REQUEST, handleSubmitProjectRequest)
}

function* handleSubmitProjectRequest(action: SubmitProjectRequestAction) {
  try {
    const { projectId, contest } = action.payload

    // TODO: Send data to bucket

    yield put(submitProjectSuccess(projectId, contest))
  } catch (error) {
    yield put(submitProjectFailure(error.message))
  }
}
