import { utils } from 'decentraland-commons'
import { Omit } from 'decentraland-dapps/dist/lib/types'
import { takeLatest, put, select, call, take } from 'redux-saga/effects'
import { getCurrentProject, getData as getProjects } from 'modules/project/selectors'
import { Deployment, ContentServiceScene } from 'modules/deployment/types'
import { Project } from 'modules/project/types'
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
  QueryRemoteCIDAction,
  LOAD_DEPLOYMENTS_REQUEST,
  LoadDeploymentsRequestAction,
  loadDeploymentsFailure,
  loadDeploymentsSuccess,
  loadDeploymentsRequest
} from './actions'
import { store } from 'modules/common/store'
import { Media } from 'modules/media/types'
import { getMedia } from 'modules/media/selectors'
import { createFiles, EXPORT_PATH, createGameFileBundle, getSceneDefinition } from 'modules/project/export'
import { recordMediaRequest, RECORD_MEDIA_SUCCESS, RecordMediaSuccessAction } from 'modules/media/actions'
import { ADD_ITEM, DROP_ITEM, RESET_ITEM, DUPLICATE_ITEM, DELETE_ITEM, SET_GROUND, UPDATE_TRANSFORM } from 'modules/scene/actions'
import { ProgressStage } from './types'
import { getCurrentDeployment, getData as getDeployments } from './selectors'
import { SET_PROJECT } from 'modules/project/actions'
import { takeScreenshot } from 'modules/editor/actions'
import { objectURLToBlob } from 'modules/media/utils'
import { AUTH_SUCCESS, AuthSuccessAction } from 'modules/auth/actions'
import { getSub, isLoggedIn } from 'modules/auth/selectors'
import { getSceneByProjectId } from 'modules/scene/utils'
import { content, CONTENT_SERVER_URL } from 'lib/api/content'
import { builder } from 'lib/api/builder'
import { buildDeployData, deploy, ContentFile, makeContentFile } from './contentUtils'
import { getIdentity } from 'modules/identity/utils'

const blacklist = ['.dclignore', 'Dockerfile', 'builder.json', 'src/game.ts']

const handleProgress = (type: ProgressStage) => (args: { loaded: number; total: number }) => {
  const { loaded, total } = args
  const progress = ((loaded / total) * 100) | 0
  store.dispatch(setProgress(type, progress))
}

export function* deploymentSaga() {
  yield takeLatest(DEPLOY_TO_POOL_REQUEST, handleDeployToPoolRequest)
  yield takeLatest(DEPLOY_TO_LAND_REQUEST, handleDeployToLandRequest)
  yield takeLatest(CLEAR_DEPLOYMENT_REQUEST, handleClearDeploymentRequest)
  yield takeLatest(QUERY_REMOTE_CID, handleQueryRemoteCID)
  yield takeLatest(ADD_ITEM, handleMarkDirty)
  yield takeLatest(DROP_ITEM, handleMarkDirty)
  yield takeLatest(RESET_ITEM, handleMarkDirty)
  yield takeLatest(DUPLICATE_ITEM, handleMarkDirty)
  yield takeLatest(DELETE_ITEM, handleMarkDirty)
  yield takeLatest(SET_GROUND, handleMarkDirty)
  yield takeLatest(UPDATE_TRANSFORM, handleMarkDirty)
  yield takeLatest(SET_PROJECT, handleMarkDirty)
  yield takeLatest(LOAD_DEPLOYMENTS_REQUEST, handleFetchDeploymentsRequest)
  yield takeLatest(AUTH_SUCCESS, handleAuthSuccess)
}

function* handleMarkDirty() {
  const project: Project | null = yield select(getCurrentProject)
  const deployment: Deployment | null = yield select(getCurrentDeployment)
  if (project && deployment && !deployment.isDirty) {
    yield put(markDirty(project.id))
  }
}

function* handleDeployToPoolRequest(action: DeployToPoolRequestAction) {
  const { projectId, additionalInfo } = action.payload
  const rawProject: Project | null = yield select(getCurrentProject)

  if (rawProject && rawProject.id === projectId) {
    const project: Omit<Project, 'thumbnail'> = utils.omit(rawProject, ['thumbnail'])

    try {
      yield put(setProgress(ProgressStage.NONE, 1))
      yield put(recordMediaRequest())
      const successAction: RecordMediaSuccessAction = yield take(RECORD_MEDIA_SUCCESS)
      const { north, east, south, west, preview } = successAction.payload.media

      if (!north || !east || !south || !west || !preview) {
        throw new Error('Failed to capture scene preview')
      }

      yield put(setProgress(ProgressStage.NONE, 30))
      yield call(() => builder.uploadMedia(rawProject.id, preview, { north, east, south, west }))

      yield put(setProgress(ProgressStage.NONE, 60))
      yield put(takeScreenshot())

      yield put(setProgress(ProgressStage.NONE, 90))
      yield call(() => builder.deployToPool(project.id, additionalInfo))

      yield put(setProgress(ProgressStage.NONE, 100))
      yield put(deployToPoolSuccess(window.URL.createObjectURL(preview)))
    } catch (e) {
      yield put(deployToPoolFailure(e.message))
    }
  } else if (rawProject) {
    yield put(deployToPoolFailure('Unable to Publish: Not current project'))
  } else {
    yield put(deployToPoolFailure('Unable to Publish: Invalid project'))
  }
}

function* handleDeployToLandRequest(action: DeployToLandRequestAction) {
  const { placement, projectId } = action.payload

  const projects: ReturnType<typeof getProjects> = yield select(getProjects)
  const project = projects[projectId]
  if (!project) {
    yield put(deployToLandFailure('Unable to Publish: Invalid project'))
    return
  }

  const scene = yield getSceneByProjectId(project.id)
  if (!scene) {
    yield put(deployToLandFailure('Unable to Publish: Invalid scene'))
    return
  }

  const identity = yield getIdentity()
  if (!identity) {
    yield put(deployToLandFailure('Unable to Publish: Invalid identity'))
    return
  }

  try {
    const files = yield call(() =>
      createFiles({
        project,
        scene,
        point: placement.point,
        rotation: placement.rotation,
        isDeploy: true,
        onProgress: handleProgress(ProgressStage.CREATE_FILES)
      })
    )

    const contentFiles: ContentFile[] = yield getContentServiceFiles(files)
    const sceneDefinition = getSceneDefinition(project, placement.point, placement.rotation)
    const [data] = yield call(() => buildDeployData(identity, [...sceneDefinition.scene.parcels], sceneDefinition, contentFiles))

    // upload media if logged in
    if (yield select(isLoggedIn)) {
      const media: Media | null = yield select(getMedia)
      if (media) {
        const north: Blob = yield call(() => objectURLToBlob(media.north))
        const east: Blob = yield call(() => objectURLToBlob(media.east))
        const south: Blob = yield call(() => objectURLToBlob(media.south))
        const west: Blob = yield call(() => objectURLToBlob(media.west))
        const thumbnail: Blob = yield call(() => objectURLToBlob(media.preview))

        yield call(() =>
          builder.uploadMedia(project.id, thumbnail, { north, east, south, west }, handleProgress(ProgressStage.UPLOAD_RECORDING))
        )
      } else {
        console.warn('Failed to upload scene preview')
      }
    }
    yield call(() => deploy(CONTENT_SERVER_URL, data))
    // generate new deployment
    const deployment: Deployment = {
      id: project.id,
      lastPublishedCID: data.entityId,
      placement,
      isDirty: false,
      userId: yield select(getSub),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // notify success
    yield put(deployToLandSuccess(deployment))
  } catch (e) {
    yield put(deployToLandFailure(e.message.split('\n')[0]))
  }
}

function* handleQueryRemoteCID(action: QueryRemoteCIDAction) {
  const { projectId } = action.payload
  const deployments: ReturnType<typeof getDeployments> = yield select(getDeployments)
  const deployment = deployments[projectId]
  if (!deployment) return
  const { x, y } = deployment.placement.point
  try {
    const res: ContentServiceScene = yield call(() => content.fetchScene(x, y))
    const lastPublishedCID: string | null = deployment.lastPublishedCID
    const remoteCID = res[0].id
    // Check for external changes: e.g. CLI
    const isUnsynced = remoteCID !== lastPublishedCID

    // Once dirty, always dirty until deployed
    if (!deployment.isDirty && isUnsynced) {
      yield put(markDirty(projectId, isUnsynced))
    }
  } catch (e) {
    // error handling
  }
}

function* handleClearDeploymentRequest(action: ClearDeploymentRequestAction) {
  const { projectId } = action.payload

  const deployments: ReturnType<typeof getDeployments> = yield select(getDeployments)
  const deployment = deployments[projectId]
  if (!deployment) {
    yield put(deployToLandFailure('Unable to Publish: Invalid deployment'))
    return
  }

  const projects: ReturnType<typeof getProjects> = yield select(getProjects)
  const project = projects[projectId]
  if (!project) {
    yield put(deployToLandFailure('Unable to Publish: Invalid project'))
    return
  }

  const scene = yield getSceneByProjectId(project.id)
  if (!scene) {
    yield put(deployToLandFailure('Unable to Publish: Invalid scene'))
    return
  }

  const identity = yield getIdentity()
  if (!identity) {
    yield put(deployToLandFailure('Unable to Publish: Invalid identity'))
    return
  }

  try {
    const { placement } = deployment
    const files = yield call(() =>
      createFiles({
        project,
        scene,
        point: placement.point,
        rotation: placement.rotation,
        isDeploy: true,
        onProgress: handleProgress(ProgressStage.CREATE_FILES)
      })
    )
    const contentFiles: ContentFile[] = yield getContentServiceFiles(files, true)
    const sceneDefinition = getSceneDefinition(project, placement.point, placement.rotation)
    const [data] = yield call(() => buildDeployData(identity, [...sceneDefinition.scene.parcels], sceneDefinition, contentFiles))
    yield call(() => deploy(CONTENT_SERVER_URL, data))
    yield put(clearDeploymentSuccess(projectId))
  } catch (e) {
    yield put(clearDeploymentFailure(e.message))
  }
}

function* getContentServiceFiles(files: Record<string, string | Blob>, createEmptyGame: boolean = false) {
  let contentFiles: ContentFile[] = []

  for (const fileName of Object.keys(files)) {
    if (blacklist.includes(fileName)) continue
    let file: ContentFile
    if (fileName === EXPORT_PATH.BUNDLED_GAME_FILE && createEmptyGame) {
      file = yield call(() => makeContentFile(fileName, createGameFileBundle('')))
    } else {
      file = yield call(() => makeContentFile(fileName, files[fileName]))
    }
    contentFiles.push(file)
  }

  return contentFiles
}

function* handleFetchDeploymentsRequest(_action: LoadDeploymentsRequestAction) {
  try {
    const deployments: Deployment[] = yield call(() => builder.fetchDeployments())
    yield put(loadDeploymentsSuccess(deployments))
  } catch (e) {
    yield put(loadDeploymentsFailure(e.message))
  }
}

function* handleAuthSuccess(_action: AuthSuccessAction) {
  yield put(loadDeploymentsRequest())
}
