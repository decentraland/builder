import { utils } from 'decentraland-commons'
import { Omit } from 'decentraland-dapps/dist/lib/types'
import { takeLatest, put, select, call, take } from 'redux-saga/effects'
import { getState as getUserState } from 'modules/user/selectors'
import { getCurrentProject } from 'modules/project/selectors'
import { getCurrentScene, getSceneById } from 'modules/scene/selectors'
import { Project } from 'modules/project/types'
import { Scene } from 'modules/scene/types'
import { User } from 'modules/user/types'
import { api } from 'lib/api'
import { eth } from 'decentraland-eth'
import {
  DEPLOY_TO_POOL_REQUEST,
  deployToPoolFailure,
  deployToPoolSuccess,
  setProgress,
  setStage,
  DEPLOY_TO_LAND_REQUEST,
  deployToLandFailure,
  DeployToLandRequestAction
} from './actions'
import { store } from 'modules/common/store'
import { createFiles } from 'modules/project/export'
import { makeContentFile, getFileManifest, getCID, buildUploadRequestMetadata } from './utils'
import { ContentServiceFile, ProgressStage } from './types'
import { recordMediaRequest, RECORD_MEDIA_SUCCESS } from 'modules/media/actions'
import { getMediaByCID } from 'modules/media/selectors'

const blacklist = ['.dclignore', 'Dockerfile', 'builder.json', 'src/game.ts']

function onUploadProgress(args: { loaded: number; total: number }) {
  const { loaded, total } = args
  const progress = ((loaded / total) * 100) | 0
  store.dispatch(setProgress(progress))
}

export function* deploymentSaga() {
  yield takeLatest(DEPLOY_TO_POOL_REQUEST, handleDeployToPoolRequest)
  yield takeLatest(DEPLOY_TO_LAND_REQUEST, handleDeployToLandRequest)
}

export function* handleDeployToPoolRequest() {
  const rawProject: Project = yield select(getCurrentProject)
  const scene: Scene = yield select(getCurrentScene)
  const user: User = yield select(getUserState)
  const project: Omit<Project, 'thumbnail'> = utils.omit(rawProject, ['thumbnail'])
  const contentFiles: ContentServiceFile[] = yield getContentServiceFiles()
  const rootCID = yield call(() => getCID(contentFiles, true))

  try {
    yield put(setStage(ProgressStage.RECORD))
    yield put(recordMediaRequest(rootCID))
    yield take(RECORD_MEDIA_SUCCESS)
    const { north, east, south, west, video, thumbnail } = yield select(getMediaByCID(rootCID))

    yield put(setStage(ProgressStage.UPLOAD_RECORDING))
    yield call(() => api.deployToPool(project, scene, user))
    yield call(() => api.publishScenePreview(rawProject.id, video, thumbnail, { north, east, south, west }, onUploadProgress))

    yield put(deployToPoolSuccess(window.URL.createObjectURL(thumbnail)))
  } catch (e) {
    yield put(deployToPoolFailure(e.message))
  }
}

export function* handleDeployToLandRequest(_: DeployToLandRequestAction) {
  // const { ethAddress } = action.payload
  const user: User = yield select(getUserState)

  if (!eth.wallet) {
    yield put(deployToLandFailure('Unable to connect to wallet'))
  }

  const contentFiles: ContentServiceFile[] = yield getContentServiceFiles()
  const rootCID = yield call(() => getCID(contentFiles, true))
  const manifest = yield call(() => getFileManifest(contentFiles))
  const timestamp = Math.round(Date.now() / 1000)
  const signature = yield call(() => eth.wallet.sign(`${rootCID}.${timestamp}`))
  const metadata = buildUploadRequestMetadata(rootCID, signature, (window as any)['ethereum'].selectedAddress, timestamp, user.id)

  yield call(() => api.uploadToContentService(rootCID, manifest, metadata, contentFiles))
}

function* getContentServiceFiles() {
  const project: Project = yield select(getCurrentProject)
  const scene: Scene = yield select(getSceneById(project.sceneId))
  const files = yield call(() =>
    createFiles({
      project,
      scene,
      point: { x: -149, y: -28 },
      onProgress: e => {
        store.dispatch(setProgress(e.progress))
      }
    })
  )

  let contentFiles: ContentServiceFile[] = []

  for (const fileName of Object.keys(files)) {
    if (blacklist.includes(fileName)) continue
    const file: ContentServiceFile = yield call(() => makeContentFile(fileName, files[fileName]))
    contentFiles.push(file)
  }

  return contentFiles
}
