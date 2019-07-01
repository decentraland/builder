import { utils } from 'decentraland-commons'
import { Omit } from 'decentraland-dapps/dist/lib/types'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { takeLatest, put, select, call, take } from 'redux-saga/effects'
import { getState as getUserState } from 'modules/user/selectors'
import { getCurrentProject, getProject } from 'modules/project/selectors'
import { getCurrentScene, getSceneById } from 'modules/scene/selectors'
import { Coordinate, Rotation, Deployment, ContentServiceValidation } from 'modules/deployment/types'
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
  markDirty,
  CLEAR_DEPLOYMENT_REQUEST,
  ClearDeploymentRequestAction,
  clearDeploymentFailure,
  clearDeploymentSuccess,
  QUERY_REMOTE_CID,
  QueryRemoteCIDAction
} from './actions'
import { store } from 'modules/common/store'
import { createFiles, EXPORT_PATH, createGameFileBundle } from 'modules/project/export'
import { recordMediaRequest, RECORD_MEDIA_SUCCESS, RecordMediaSuccessAction } from 'modules/media/actions'
import { ADD_ITEM, DROP_ITEM, RESET_ITEM, DUPLICATE_ITEM, DELETE_ITEM, SET_GROUND, UPDATE_TRANSFORM } from 'modules/scene/actions'
import { makeContentFile, getFileManifest, buildUploadRequestMetadata, getCID } from './utils'
import { ContentServiceFile, ProgressStage } from './types'
import { getCurrentDeployment, getDeployment } from './selectors'
import { EDIT_PROJECT_SUCCESS } from 'modules/project/actions'

const blacklist = ['.dclignore', 'Dockerfile', 'builder.json', 'src/game.ts']

const handleProgress = (type: ProgressStage) => (args: { loaded: number; total: number }) => {
  const { loaded, total } = args
  const progress = ((loaded / total) * 100) | 0
  store.dispatch(setProgress(type, progress))
}

export function* deploymentSaga() {
  yield takeLatest(DEPLOY_TO_POOL_REQUEST, handleDeployToPoolRequest)
  yield takeLatest(DEPLOY_TO_LAND_REQUEST, handleDeployToLandRequest)
  yield takeLatest(CLEAR_DEPLOYMENT_REQUEST, handleClearDeployment)
  yield takeLatest(QUERY_REMOTE_CID, handleQueryRemoteCID)

  yield takeLatest(ADD_ITEM, handleMarkDirty)
  yield takeLatest(DROP_ITEM, handleMarkDirty)
  yield takeLatest(RESET_ITEM, handleMarkDirty)
  yield takeLatest(DUPLICATE_ITEM, handleMarkDirty)
  yield takeLatest(DELETE_ITEM, handleMarkDirty)
  yield takeLatest(SET_GROUND, handleMarkDirty)
  yield takeLatest(UPDATE_TRANSFORM, handleMarkDirty)
  yield takeLatest(EDIT_PROJECT_SUCCESS, handleMarkDirty)
}

function* handleMarkDirty() {
  const project: Project | null = yield select(getCurrentProject)
  const deployment: Deployment | null = yield select(getCurrentDeployment)
  if (deployment && project) {
    yield put(markDirty(project.id))
  }
}

function* handleDeployToPoolRequest(_: DeployToPoolRequestAction) {
  const rawProject: Project | null = yield select(getCurrentProject)
  const scene: Scene = yield select(getCurrentScene)
  const user: User = yield select(getUserState)

  if (rawProject) {
    const project: Omit<Project, 'thumbnail'> = utils.omit(rawProject, ['thumbnail'])

    try {
      yield put(recordMediaRequest())
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

function* handleDeployToLandRequest(action: DeployToLandRequestAction) {
  const { placement, projectId } = action.payload
  const ethAddress = yield select(getAddress)
  const user: User = yield select(getUserState)
  const project: Project | null = yield select(getProject(projectId))

  if (!eth.wallet) {
    yield put(deployToLandFailure('Unable to connect to wallet'))
  }

  if (project) {
    try {
      const contentFiles: ContentServiceFile[] = yield getContentServiceFiles(placement.point, placement.rotation)
      const rootCID = yield call(() => getCID(contentFiles, true))
      const manifest = yield call(() => getFileManifest(contentFiles))
      const timestamp = Math.round(Date.now() / 1000)
      const signature = yield call(() => eth.wallet.sign(`${rootCID}.${timestamp}`))
      const metadata = buildUploadRequestMetadata(rootCID, signature, ethAddress, timestamp, user.id)

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

function* handleQueryRemoteCID(action: QueryRemoteCIDAction) {
  const { projectId } = action.payload
  const deployment: Deployment | null = yield select(getDeployment(projectId))
  if (!deployment) return
  const { x, y } = deployment.placement.point
  try {
    const res: ContentServiceValidation = yield call(() => api.fetchContentServerValidation(x, y))
    const lastPublishedCID: string | null = deployment.lastPublishedCID
    const remoteCID = res.root_cid

    if (!deployment.isDirty) {
      const isSynced = remoteCID === lastPublishedCID
      yield put(markDirty(projectId, !isSynced))
    }
  } catch (e) {
    // error handling
  }
}

function* handleClearDeployment(action: ClearDeploymentRequestAction) {
  const { projectId } = action.payload
  const ethAddress = yield select(getAddress)
  const user: User = yield select(getUserState)
  const deployment: Deployment | null = yield select(getDeployment(projectId))
  const project: Project | null = yield select(getProject(projectId))

  if (!eth.wallet) {
    yield put(deployToLandFailure('Unable to connect to wallet'))
  }

  if (project && deployment) {
    const { placement } = deployment
    const contentFiles: ContentServiceFile[] = yield getContentServiceFiles(placement.point, placement.rotation, true)
    const rootCID = yield call(() => getCID(contentFiles, true))
    const manifest = yield call(() => getFileManifest(contentFiles))
    const timestamp = Math.round(Date.now() / 1000)
    const signature = yield call(() => eth.wallet.sign(`${rootCID}.${timestamp}`))
    const metadata = buildUploadRequestMetadata(rootCID, signature, ethAddress, timestamp, user.id)

    try {
      yield call(() =>
        api.uploadToContentService(rootCID, manifest, metadata, contentFiles, handleProgress(ProgressStage.UPLOAD_SCENE_ASSETS))
      )
      yield put(clearDeploymentSuccess(projectId))
    } catch (e) {
      yield put(clearDeploymentFailure(e.message))
    }
  } else {
    yield put(clearDeploymentFailure('Unable to Publish: Invalid project'))
  }
}

function* getContentServiceFiles(point: Coordinate, rotation: Rotation, createEmptyGame: boolean = false) {
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
      let file: ContentServiceFile
      if (fileName === EXPORT_PATH.BUNDLED_GAME_FILE && createEmptyGame) {
        file = yield call(() => makeContentFile(fileName, createGameFileBundle('')))
      } else {
        file = yield call(() => makeContentFile(fileName, files[fileName]))
      }
      contentFiles.push(file)
    }

    return contentFiles
  }

  return []
}
