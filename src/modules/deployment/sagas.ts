import { utils } from 'decentraland-commons'
import { Omit } from 'decentraland-dapps/dist/lib/types'
import { takeLatest, put, select, call } from 'redux-saga/effects'
import { getState as getUserState } from 'modules/user/selectors'
import { getCurrentProject } from 'modules/project/selectors'
import { getCurrentScene } from 'modules/scene/selectors'
import { handleTakePictures } from 'modules/editor/sagas'
import { Project } from 'modules/project/types'
import { Scene } from 'modules/scene/types'
import { User } from 'modules/user/types'
import { api } from 'lib/api'
import {
  DEPLOY_TO_POOL_REQUEST,
  deployToPoolFailure,
  deployToPoolSuccess,
  setProgress,
  setStage,
  DeployToPoolRequestAction
} from './actions'
import { store } from 'modules/common/store'

function onUploadProgress(args: { loaded: number; total: number }) {
  const { loaded, total } = args
  const progress = ((loaded / total) * 100) | 0
  store.dispatch(setProgress(progress))
}

export function* deploymentSaga() {
  yield takeLatest(DEPLOY_TO_POOL_REQUEST, handleDeployToPoolRequest)
}

export function* handleDeployToPoolRequest(action: DeployToPoolRequestAction) {
  const rawProject: Project = yield select(getCurrentProject)
  const scene: Scene = yield select(getCurrentScene)
  const user: User = yield select(getUserState)
  const project: Omit<Project, 'thumbnail'> = utils.omit(rawProject, ['thumbnail'])

  try {
    yield put(setStage('record'))
    const data = yield handleTakePictures()

    yield put(setStage('upload'))
    yield call(() => api.deployToPool(project, scene, user, action.payload.ethAddress))
    yield call(() => api.publishScenePreview(rawProject.id, data.thumbnail, data.shots, onUploadProgress))

    yield put(deployToPoolSuccess(window.URL.createObjectURL(data.thumbnail)))
  } catch (e) {
    yield put(deployToPoolFailure(e.message))
  }
}
