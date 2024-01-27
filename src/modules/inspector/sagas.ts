/* eslint-disable no-debugger */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { call, delay, put, race, select, take, takeEvery } from 'redux-saga/effects'
import { future, IFuture } from 'fp-future'
import { hashV1 } from '@dcl/hashing'
import { isErrorWithMessage } from 'decentraland-dapps/dist/lib/error'
import { merge } from 'ts-deepmerge'
import { LoginFailureAction, LoginSuccessAction, LOGIN_FAILURE, LOGIN_SUCCESS } from 'modules/identity/actions'
import { isLoggingIn } from 'modules/identity/selectors'
import { getProjectId } from 'modules/location/utils'
import {
  LoadProjectSceneFailureAction,
  loadProjectSceneRequest,
  LoadProjectSceneSuccessAction,
  LoadProjectsFailureAction,
  loadProjectsRequest,
  LoadProjectsSuccessAction,
  LOAD_PROJECTS_FAILURE,
  LOAD_PROJECTS_REQUEST,
  LOAD_PROJECTS_SUCCESS,
  LOAD_PROJECT_SCENE_FAILURE,
  LOAD_PROJECT_SCENE_SUCCESS,
  editProject
} from 'modules/project/actions'
import { getCurrentProject, getData as getProjects, getLoading as getLoadingProjects } from 'modules/project/selectors'
import { getCurrentScene } from 'modules/scene/selectors'
import {
  ConnectInspectorAction,
  CONNECT_INSPECTOR,
  OpenInspectorAction,
  OPEN_INSPECTOR,
  rpcFailure,
  RPCFailureAction,
  rpcRequest,
  RPCRequestAction,
  rpcSuccess,
  RPCSuccessAction,
  RPC_FAILURE,
  RPC_REQUEST,
  RPC_SUCCESS,
  toggleScreenshot
} from './actions'
import { Project } from 'modules/project/types'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { IframeStorage, UiClient } from '@dcl/inspector'
import { MessageTransport } from '@dcl/mini-rpc'
import { getParcels } from './utils'
import { BuilderAPI, getContentsStorageUrl } from 'lib/api/builder'
import { NO_CACHE_HEADERS } from 'lib/headers'
import { Scene, SceneSDK7 } from 'modules/scene/types'
import { updateScene, UPDATE_SCENE } from 'modules/scene/actions'
import { RootStore } from 'modules/common/types'
import { takeScreenshot } from 'modules/editor/actions'
import { isScreenshotEnabled } from './selectors'

let nonces = 0
const getNonce = () => nonces++
const promises = new Map<number, IFuture<unknown>>()
const assets = new Map<string, Buffer>()

export function* inspectorSaga(builder: BuilderAPI, store: RootStore) {
  yield takeEvery(OPEN_INSPECTOR, handleOpenInspector)
  yield takeEvery(CONNECT_INSPECTOR, handleConnectInspector)
  yield takeEvery(RPC_REQUEST, handleRpcRequest)
  yield takeEvery(RPC_SUCCESS, handleRpcSuccess)
  yield takeEvery(RPC_FAILURE, handleRpcFailure)
  yield takeEvery(UPDATE_SCENE, handleUpdateScene)

  function* handleOpenInspector(_action: OpenInspectorAction) {
    try {
      const projectId = getProjectId()
      if (!projectId) {
        throw new Error(`Invalid projectId=${projectId}`)
      }
      const loggingIn: boolean = yield select(isLoggingIn)
      if (loggingIn) {
        const result: { success?: LoginSuccessAction; failure?: LoginFailureAction } = yield race({
          success: take(LOGIN_SUCCESS),
          failure: take(LOGIN_FAILURE)
        })

        if (result.failure) {
          throw new Error('Could not load login')
        }
      }

      const project: Project = yield getProject(projectId)

      yield put(loadProjectSceneRequest(project))

      const result: { success?: LoadProjectSceneSuccessAction; failure?: LoadProjectSceneFailureAction } = yield race({
        success: take(LOAD_PROJECT_SCENE_SUCCESS),
        failure: take(LOAD_PROJECT_SCENE_FAILURE)
      })

      if (result.failure) {
        throw new Error('Could not load scene')
      }
    } catch (error) {
      console.error(error)
    }
  }

  function* handleConnectInspector(action: ConnectInspectorAction) {
    const { iframeId } = action.payload

    const iframe = document.getElementById(iframeId) as HTMLIFrameElement | null
    if (iframe === null) {
      throw new Error(`Iframe with id="${iframeId}" not found`)
    }

    // disable the screenshots, turn it on once the scene is fully loaded
    yield put(toggleScreenshot(false))

    const transport = new MessageTransport(window, iframe.contentWindow!, '*')
    const storage = new IframeStorage.Server(transport)

    const methods = Object.keys(handlers) as (keyof typeof handlers)[]
    for (const method of methods) {
      storage.handle(method, params => {
        const nonce = getNonce()
        const action = rpcRequest(method, params, nonce)
        const promise = future()
        promises.set(nonce, promise)
        store.dispatch(action)
        return promise
      })
    }

    // configure UI
    const ui = new UiClient(transport)
    yield call([ui, 'selectAssetsTab'], 'AssetsPack')
    yield call([ui, 'toggleSceneInspectorTab'], 'layout', false)

    // wait for RPC to be idle (3 seconds)
    yield waitForRpcIdle(3000)

    // turn on screenshots
    yield put(toggleScreenshot(true))

    // check if project doesn't have a thumbnail (ie. because it's new), and if so, take a screenshot
    const project: Project | null = yield select(getCurrentProject)
    if (project) {
      const result: boolean = yield call(hasThumbnail, project)
      if (!result) {
        yield put(takeScreenshot())
      }
    }
  }

  function* handleRpcRequest(action: RPCRequestAction) {
    const { method, params, nonce } = action.payload
    try {
      const handler = handlers[method]
      const result: IframeStorage.Result[IframeStorage.Method] = yield handler(params)
      yield put(rpcSuccess(method, result, nonce))
    } catch (error) {
      yield put(rpcFailure(method, params, isErrorWithMessage(error) ? error.message : 'Unknown error', nonce))
    }
  }

  function handleRpcSuccess(action: RPCSuccessAction) {
    const { result, nonce } = action.payload
    const promise = promises.get(nonce)
    if (promise) {
      promise.resolve(result)
    }
  }

  function handleRpcFailure(action: RPCFailureAction) {
    const { error, nonce } = action.payload
    const promise = promises.get(nonce)
    if (promise) {
      promise.reject(new Error(error))
    }
  }

  function* handleUpdateScene() {
    const isEnabled: boolean = yield select(isScreenshotEnabled)
    if (isEnabled) {
      yield put(takeScreenshot())
    }
  }

  // HANDLERS

  const handlers: Record<`${IframeStorage.Method}`, (params: any) => Generator> = {
    read_file: handleReadFile,
    exists: handleExists,
    list: handleList,
    write_file: handleWriteFile,
    delete: handleDelete
  }

  function* handleReadFile(params: IframeStorage.Params['read_file']) {
    const { path } = params

    const scene: SceneSDK7 = yield getScene()

    if (assets.has(path)) {
      return assets.get(path)
    }

    if (path in scene.mappings) {
      const hash = scene.mappings[path]
      const response: Response = yield call(fetch, getContentsStorageUrl(hash), { headers: NO_CACHE_HEADERS })
      const buffer: ArrayBuffer = yield call([response, 'arrayBuffer'])
      return Buffer.from(buffer)
    }

    let file = ''
    switch (path) {
      case 'scene.json': {
        const project: Project = yield select(getCurrentProject)
        let metadata: SceneSDK7['metadata'] = {
          display: {
            title: project.title,
            description: project.description
          },
          scene: {
            parcels: getParcels(project.layout).map($ => `${$.x},${$.y}`),
            base: '0,0'
          }
        }
        if (scene.metadata) {
          metadata = merge.withOptions({ mergeArrays: true }, metadata, scene.metadata)
        }
        file = JSON.stringify(metadata)
        break
      }
      case 'assets/scene/main.composite': {
        file = JSON.stringify(scene.composite)
        break
      }
      case 'inspector-preferences.json': {
        // TODO: this is hardcoded now but we could store this on redux and persist it across sessions
        file = JSON.stringify({
          version: 1,
          data: {
            freeCameraInvertRotation: false,
            autosaveEnabled: true
          }
        })
        break
      }
    }
    const buffer = Buffer.from(file, 'utf-8')
    return buffer
  }

  function* handleExists(params: IframeStorage.Params['exists']) {
    const { path } = params
    switch (path) {
      case 'scene.json':
      case 'assets/scene/main.composite':
      case 'inspector-preferences.json': {
        return true
      }
      default: {
        const scene: SceneSDK7 = yield getScene()
        return path in scene.mappings
      }
    }
  }

  function* handleList(params: IframeStorage.Params['list']) {
    const { path } = params

    const scene: SceneSDK7 = yield getScene()
    const paths = [...Object.keys(scene.mappings), 'assets/scene/main.composite']
    const files: { name: string; isDirectory: boolean }[] = []

    for (const _path of paths) {
      if (!_path.startsWith(path)) continue

      const fileName = _path.substring(path.length)
      const slashPosition = fileName.indexOf('/')
      if (slashPosition !== -1) {
        const directoryName = fileName.substring(0, slashPosition)
        if (!files.find(item => item.name === directoryName)) {
          files.push({ name: directoryName, isDirectory: true })
        }
      } else {
        files.push({ name: fileName, isDirectory: false })
      }
    }

    return files
  }

  function* handleWriteFile(params: IframeStorage.Params['write_file']) {
    const { path, content } = params
    switch (path) {
      case 'scene.json': {
        const metadata = JSON.parse(new TextDecoder().decode(content))
        const project: Project = yield select(getCurrentProject)
        if (project.title !== metadata.display.title || project.description !== metadata.display.description) {
          yield put(
            editProject(project.id, {
              ...project,
              title: metadata.display.title,
              description: metadata.display.description
            })
          )
        }
        const scene: SceneSDK7 = yield getScene()
        const newScene: SceneSDK7 = {
          ...scene,
          metadata
        }
        yield put(updateScene(newScene))
        break
      }
      case 'assets/scene/main.composite': {
        const scene: SceneSDK7 = yield getScene()
        const newScene: SceneSDK7 = {
          ...scene,
          composite: JSON.parse(new TextDecoder().decode(content))
        }
        yield put(updateScene(newScene))
        break
      }
      case 'inspector-preferences.json': {
        // TODO: save user config somewhere in redux and persist it between sessions
        break
      }
      case 'main.crdt': {
        const project: Project = yield select(getCurrentProject)
        assets.set('main.crdt', content)
        const blob = new Blob([content])
        void builder.uploadCrdt(blob, project.id)
        break
      }
      default: {
        const hash: string = yield call(hashV1, content)

        const isUploaded: boolean = yield call(isContentUploaded, path, hash)

        if (!isUploaded) {
          // keep asset in memory while uploading it
          assets.set(path, content)
          const blob = new Blob([content])
          // we dont await for the upload and serve the file from memory in the meantime to have a faster feedback
          void builder.uploadFile(blob)
        }

        const scene: SceneSDK7 = yield getScene()
        const newScene: SceneSDK7 = {
          ...scene,
          mappings: {
            ...scene.mappings,
            [path]: hash
          }
        }
        yield put(updateScene(newScene))
        break
      }
    }
  }

  function* handleDelete(params: IframeStorage.Params['delete']) {
    const { path } = params

    const scene: SceneSDK7 = yield getScene()

    if (path in scene.mappings) {
      const newMappings = { ...scene.mappings }
      delete newMappings[path]
      const newScene: SceneSDK7 = {
        ...scene,
        mappings: newMappings
      }
      yield put(updateScene(newScene))
    }
    // remove from memory
    assets.delete(path)
  }
}

function* getProject(projectId: string): any {
  // grab projects from store
  const projects: Record<string, Project> = yield select(getProjects)
  const project = projects[projectId]

  // if project is found in store, return it
  if (project) {
    return project
  }

  // if project is not in the store, check if projects are being loaded
  const projectsLoadingState: ReturnType<typeof getLoadingProjects> = yield select(getLoadingProjects)
  const isLoading = isLoadingType(projectsLoadingState, LOAD_PROJECTS_REQUEST)

  // if projects are not being loaded, then request them
  if (!isLoading) {
    yield put(loadProjectsRequest())
  }

  // wait for projects to be loaded
  const result: { success?: LoadProjectsSuccessAction; failure?: LoadProjectsFailureAction } = yield race({
    success: take(LOAD_PROJECTS_SUCCESS),
    failure: take(LOAD_PROJECTS_FAILURE)
  })

  // if load is successful try getting the project again
  if (result.success) {
    const _project: Project = yield getProject(projectId)
    return _project
  }

  // if load fails then throw
  if (result.failure) {
    console.error(result.failure)
    throw new Error(`Could not load project`)
  }
}

function* getScene() {
  const project: Project = yield select(getCurrentProject)

  if (!project) {
    throw new Error('Invalid project')
  }

  const scene: Scene | null = yield select(getCurrentScene)

  if (!scene) {
    throw new Error('Invalid scene')
  }

  if (!scene.sdk7) {
    throw new Error('Scene must be SDK7')
  }

  return scene.sdk7
}

function* isContentUploaded(path: string, hash: string) {
  if (assets.has(path)) {
    const currentContent = assets.get(path)!
    const currentHash: string = yield call(hashV1, currentContent)
    if (hash === currentHash) {
      return true
    }
  }
  try {
    const res: Response = yield call(fetch, `${getContentsStorageUrl(hash)}/exists`, { headers: NO_CACHE_HEADERS })
    return res.ok
  } catch (error) {
    return false
  }
}

function* waitForRpcIdle(ms: number) {
  const { request }: { request: RPCRequestAction | null } = yield race({
    request: take(RPC_REQUEST),
    timeout: delay(ms, true)
  })
  if (request) {
    let elapsed = 0
    while (elapsed < ms) {
      const timestamp = Date.now()
      yield race([take(RPC_REQUEST), delay(ms, true)])
      elapsed = Date.now() - timestamp
    }
  }
}

function* hasThumbnail(project: Project) {
  try {
    if (!project.thumbnail) return false
    const response: Response = yield call(fetch, project.thumbnail, { headers: NO_CACHE_HEADERS })
    return response.ok
  } catch (error) {
    return false
  }
}
