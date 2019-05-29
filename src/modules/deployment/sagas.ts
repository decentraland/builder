import { takeLatest, put } from 'redux-saga/effects'
import { DEPLOY_TO_POOL_REQUEST, deployToPoolFailure, deployToPoolSuccess } from './actions'
import { handleRecordVideo } from 'modules/editor/sagas'

export function* deploymentSaga() {
  yield takeLatest(DEPLOY_TO_POOL_REQUEST, handleDeployToPoolRequest)
}

export function* handleDeployToPoolRequest() {
  try {
    const data = yield handleRecordVideo()
    console.log(window.URL.createObjectURL(data.blob), data.thumbnail)
    yield put(deployToPoolSuccess())
  } catch (e) {
    yield put(deployToPoolFailure(e.message))
  }
}
