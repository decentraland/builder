import { utils } from 'decentraland-commons'
import { Omit } from 'decentraland-dapps/dist/lib/types'
import { takeLatest, put, select, call, take } from 'redux-saga/effects'
import { getState as getUserState } from 'modules/user/selectors'
import { getCurrentProject } from 'modules/project/selectors'
import { getCurrentScene, getSceneById } from 'modules/scene/selectors'
import { Coordinate, Rotation, Deployment } from 'modules/deployment/types'
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
  DEPLOY_TO_LAND_REQUEST,
  deployToLandFailure,
  DeployToLandRequestAction,
  DeployToPoolRequestAction,
  deployToLandSuccess,
  markDirty
} from './actions'
import { store } from 'modules/common/store'
import { createFiles } from 'modules/project/export'
import { makeContentFile, getFileManifest, buildUploadRequestMetadata, getCID } from './utils'
import { recordMediaRequest, RECORD_MEDIA_SUCCESS, RecordMediaSuccessAction } from 'modules/media/actions'
import { PROVISION_SCENE } from 'modules/scene/actions'
import { EDITOR_REDO, EDITOR_UNDO } from 'modules/editor/actions'
import { ContentServiceFile, ProgressStage } from './types'
import { getDeployment } from './selectors'

const blacklist = ['.dclignore', 'Dockerfile', 'builder.json', 'src/game.ts']

const handleProgress = (type: ProgressStage) => (args: { loaded: number; total: number }) => {
  const { loaded, total } = args
  const progress = ((loaded / total) * 100) | 0
  store.dispatch(setProgress(type, progress))
}

export function* deploymentSaga() {
  yield takeLatest(DEPLOY_TO_POOL_REQUEST, handleDeployToPoolRequest)
  yield takeLatest(DEPLOY_TO_LAND_REQUEST, handleDeployToLandRequest)
  yield takeLatest(PROVISION_SCENE, handleMarkDirty)
  yield takeLatest(EDITOR_REDO, handleMarkDirty)
  yield takeLatest(EDITOR_UNDO, handleMarkDirty)
}

function* handleMarkDirty() {
  const project: Project | null = yield select(getCurrentProject)
  const deployment: Deployment | null = yield select(getDeployment)
  if (deployment && project) {
    yield put(markDirty(project.id))
  }
}

export function* handleDeployToPoolRequest(_: DeployToPoolRequestAction) {
  const rawProject: Project | null = yield select(getCurrentProject)
  const scene: Scene = yield select(getCurrentScene)
  const user: User = yield select(getUserState)

  if (rawProject) {
    const project: Omit<Project, 'thumbnail'> = utils.omit(rawProject, ['thumbnail'])

    try {
      yield put(recordMediaRequest(null))
      const successAction: RecordMediaSuccessAction = yield take(RECORD_MEDIA_SUCCESS)
      const { north, east, south, west, thumbnail } = successAction.payload.media

      if (!north || !east || !south || !west || !thumbnail) {
        throw new Error('Failed to capture scene preview')
      }

      yield call(() => api.deployToPool(project, scene, user))
      yield call(() =>
        api.publishScenePreview(rawProject.id, thumbnail, { north, east, south, west }, handleProgress(ProgressStage.UPLOAD_RECORDING))
      )

      yield put(deployToPoolSuccess(window.URL.createObjectURL(thumbnail)))
    } catch (e) {
      yield put(deployToPoolFailure(e.message))
    }
  } else {
    yield put(deployToPoolFailure('Unable to Publish: Invalid project'))
  }
}

export function* handleDeployToLandRequest(action: DeployToLandRequestAction) {
  const { ethAddress, placement } = action.payload
  const user: User = yield select(getUserState)
  const project: Project | null = yield select(getCurrentProject)

  if (!eth.wallet) {
    yield put(deployToLandFailure('Unable to connect to wallet'))
  }

  if (project) {
    const contentFiles: ContentServiceFile[] = yield getContentServiceFiles(placement.point, placement.rotation)
    const rootCID = yield call(() => getCID(contentFiles, true))
    const manifest = yield call(() => getFileManifest(contentFiles))
    const timestamp = Math.round(Date.now() / 1000)
    const signature = yield call(() => eth.wallet.sign(`${rootCID}.${timestamp}`))
    const metadata = buildUploadRequestMetadata(rootCID, signature, ethAddress, timestamp, user.id)

    try {
      yield call(() =>
        api.uploadToContentService(rootCID, manifest, metadata, contentFiles, handleProgress(ProgressStage.UPLOAD_SCENE_ASSETS))
      )
      yield put(deployToLandSuccess(project.id, rootCID, placement))
    } catch (e) {
      yield put(deployToLandFailure(e.message))
    }
  } else {
    yield put(deployToLandFailure('Unable to Publish: Invalid project'))
  }
}

function* getContentServiceFiles(point: Coordinate, rotation: Rotation) {
  const project: Project | null = yield select(getCurrentProject)

  if (project) {
    const scene: Scene = yield select(getSceneById(project.sceneId))

    const files = yield call(() =>
      createFiles({
        project,
        scene,
        point,
        rotation,
        onProgress: handleProgress(ProgressStage.CREATE_FILES)
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

  return []
}
