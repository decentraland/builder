import { takeLatest, put, select } from 'redux-saga/effects'
import { DEPLOY_TO_POOL_REQUEST, deployToPoolFailure, deployToPoolSuccess } from './actions'
import { handleRecordVideo } from 'modules/editor/sagas'
import { api } from 'lib/api'
import { getCurrentProject } from 'modules/project/selectors'
import { Project } from 'modules/project/types'

export function* deploymentSaga() {
  yield takeLatest(DEPLOY_TO_POOL_REQUEST, handleDeployToPoolRequest)
}

export function* handleDeployToPoolRequest() {
  const project: Project = yield select(getCurrentProject)
  try {
    const data = yield handleRecordVideo()

    api.deployToPool(project, data.video, data.thumbnail)

    console.log(window.URL.createObjectURL(data.video), window.URL.createObjectURL(data.thumbnail))
    yield put(deployToPoolSuccess())
  } catch (e) {
    yield put(deployToPoolFailure(e.message))
  }
}
